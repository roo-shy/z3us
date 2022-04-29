import TransportNodeHid from '@ledgerhq/hw-transport-webhid'
import { Network as NetworkID, Account, AccountT, AccountAddress, SigningKey } from '@radixdlt/application'
import { HDPathRadix, PrivateKey, HDMasterSeed, HDMasterSeedT } from '@radixdlt/crypto'
import { HardwareWalletLedger } from '@radixdlt/hardware-ledger'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { JSONToHex } from '@src/utils/encoding'
import { MessageService } from '@src/services/messanger'
import {
	HAS,
	LOCK,
	NEW,
	RESET,
	UNLOCK,
	AUTH_HAS,
	AUTH_RESET,
	AUTH_REGISTRATION_OPTIONS,
	AUTH_VERIFY_REGISTRATION,
	AUTH_AUTHENTICATION_OPTIONS,
	AUTH_VERIFY_AUTHENTICATION,
} from '@src/lib/actions'
import { ColorSettings } from '@src/services/types'
import { HardwareWalletT } from '@radixdlt/hardware-wallet'

export type Network = {
	id: NetworkID
	url: URL
}

export type PendingAction = { payloadHex: string; createdAt: Date }

export type MasterSeed = HDMasterSeedT | null

export type AddressBookEntry = {
	name?: string
	isOwn?: boolean
	background?: string
	colorSettings?: { [key in ColorSettings]: string }
}

export type WalletStore = {
	messanger: MessageService | null
	setMessangerAction: (messanger: MessageService) => void
	sendResponseAction: (action: string, data: any) => Promise<void>
	hasKeystoreAction: () => Promise<boolean>
	createWalletAction: (words: string[], password: string) => Promise<void>
	unlockWalletAction: (password: string) => Promise<void>
	resetWalletAction: () => Promise<void>
	lockAction: () => Promise<void>
	hasAuthAction: () => Promise<boolean>
	removeCredentialAction: () => Promise<void>
	registerCredentialAction: (
		userID: string,
		userName: string,
		userDisplayName: string,
		password: string,
	) => Promise<string>
	authenticateAction: () => Promise<string>

	hasKeystore: boolean
	account: AccountT | null

	masterSeed: MasterSeed
	setMasterSeedAction: (seed: MasterSeed) => void
	setHasKeystoreAction: (hasKeystore: boolean) => void

	hardwareWallet: HardwareWalletT | null
	setHardwareWalletAction: (hardwareWallet: HardwareWalletT) => void
	setHWPublicAddressesAction: (addresses: string[]) => void
	removeLastHWPublicAddressAction: () => void
	sendAPDUAction: (
		cla: number,
		ins: number,
		p1: number,
		p2: number,
		data?: Buffer,
		statusList?: number[],
	) => Promise<Buffer>

	publicAddresses: string[]
	hwPublicAddresses: string[]
	addressBook: { [key: string]: AddressBookEntry }
	setPublicAddressesAction: (addresses: string[]) => void
	removeLastPublicAddressAction: () => void
	setAddressBookEntryAction: (address: string, entry: AddressBookEntry) => void
	removeAddressBookEntryAction: (address: string) => void

	walletUnlockTimeoutInMinutes: number
	setWalletUnclokTimeoutInMinutesAction: (timeoutInMinutes: number) => void

	selectedAccountIndex: number
	selectAccountAction: (newIndex: number) => void
	selectAccountForAddressAction: (address: string) => void

	networks: Network[]
	selectedNetworkIndex: number
	selectNetworkAction: (newIndex: number) => void
	addNetworkAction: (id: NetworkID, url: URL) => void

	activeApp: Array<string | number>
	setActiveAppAction: (activeApp: Array<string | number>) => void

	activeSlideIndex: number
	setActiveSlideIndexAction: (newIndex: number) => void

	accountPanelExpanded: boolean
	setAccountPanelExpandedAction: (expanded: boolean) => void

	approvedWebsites: {
		[key: string]: any
	}
	approveWebsiteAction: (host: string) => void
	declineWebsiteAction: (host: string) => void

	pendingActions: {
		[key: string]: PendingAction
	}
	addPendingActionAction: (id: string, request: any) => void
	removePendingActionAction: (id: string) => void
}

export const whiteList = [
	'walletUnlockTimeoutInMinutes',
	'publicAddresses',
	'hwPublicAddresses',
	'addressBook',
	'networks',
	'activeSlideIndex',
	'selectedNetworkIndex',
	'selectedAccountIndex',
	'accountPanelExpanded',
	'approvedWebsites',
	'pendingActions',
]

const rpName = 'z3us'

const mainnetURL = new URL('https://mainnet.radixdlt.com')
const stokenetURL = new URL('https://stokenet.radixdlt.com')

const defaultState = {
	messanger: null,
	account: null,
	hasKeystore: false,
	masterSeed: null,
	hardwareWallet: null,
	hwPublicAddresses: [],
	publicAddresses: [],
	addressBook: {},

	networks: [
		{ id: NetworkID.MAINNET, url: mainnetURL },
		{ id: NetworkID.STOKENET, url: stokenetURL },
	],

	activeApp: ['accounts', 0],
	activeSlideIndex: -1,
	accountPanelExpanded: false,
	selectedNetworkIndex: 0,
	selectedAccountIndex: 0,
	walletUnlockTimeoutInMinutes: 5,

	approvedWebsites: {},
	pendingActions: {},
}

export const connectHW = async (state: WalletStore) => {
	if (state.selectedAccountIndex < state.publicAddresses.length) return

	const selectedAccountIndex = state.selectedAccountIndex - state.publicAddresses.length

	if (!state.hardwareWallet) {
		state.hardwareWallet = await HardwareWalletLedger.create({ send: state.sendAPDUAction }).toPromise()
	}

	const hdPath = HDPathRadix.create({ address: { index: selectedAccountIndex, isHardened: true } })
	const hardwareSigningKey = await state.hardwareWallet.makeSigningKey(hdPath, false).toPromise()

	const signingKey = SigningKey.fromHDPathWithHWSigningKey({ hdPath, hardwareSigningKey })

	const network = state.networks[state.selectedNetworkIndex]
	const address = AccountAddress.fromPublicKeyAndNetwork({
		publicKey: signingKey.publicKey,
		network: network.id,
	})

	state.account = Account.create({ address, signingKey })
	if (state.hwPublicAddresses.length <= selectedAccountIndex) {
		state.hwPublicAddresses = [...state.hwPublicAddresses, address.toString()]
	} else {
		state.hwPublicAddresses[selectedAccountIndex] = address.toString()
	}
}

const setMasterSeed = (state: WalletStore, seed: MasterSeed) => {
	state.masterSeed = seed

	if (!seed) return

	if (state.selectedAccountIndex >= state.publicAddresses.length) return

	const key = seed
		.masterNode()
		.derive(HDPathRadix.create({ address: { index: state.selectedAccountIndex, isHardened: true } }))

	const pk = PrivateKey.fromHex(key.privateKey.toString())
	if (pk.isErr()) {
		throw pk.error
	}

	const signingKey = SigningKey.fromPrivateKey({
		privateKey: pk.value,
	})

	const address = AccountAddress.fromPublicKeyAndNetwork({
		publicKey: key.publicKey,
		network: state.networks[state.selectedNetworkIndex].id,
	})

	state.account = Account.create({ address, signingKey })
	if (state.publicAddresses.length <= state.selectedAccountIndex) {
		state.publicAddresses = [...state.publicAddresses, address.toString()]
	} else {
		state.publicAddresses[state.selectedAccountIndex] = address.toString()
	}
}

const selectAccount = (state: WalletStore, newIndex: number) => {
	state.selectedAccountIndex = newIndex
	state.activeSlideIndex = newIndex
	setMasterSeed(state, state.masterSeed)
	connectHW(state)
}

const selectNetwork = (state: WalletStore, newIndex: number) => {
	for (let i = 0; i < state.publicAddresses.length + state.hwPublicAddresses.length; i += 1) {
		state.selectedNetworkIndex = i
		setMasterSeed(state, state.masterSeed)
		connectHW(state)
	}

	state.selectedNetworkIndex = newIndex
	setMasterSeed(state, state.masterSeed)
	connectHW(state)
}

export const createWalletStore = (set, get) => ({
	...defaultState,

	hasAuthAction: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		return messanger.sendActionMessageFromPopup(AUTH_HAS, null)
	},

	removeCredentialAction: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}

		const resp = await messanger.sendActionMessageFromPopup(AUTH_RESET, null)

		return resp
	},

	registerCredentialAction: async (userID: string, userName: string, userDisplayName: string, password: string) => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}

		const options = await messanger.sendActionMessageFromPopup(AUTH_REGISTRATION_OPTIONS, {
			rpID: window.location.hostname,
			rpName,
			userID,
			userName,
			userDisplayName,
			password,
		})

		const credential = await startRegistration(options)

		const resp = await messanger.sendActionMessageFromPopup(AUTH_VERIFY_REGISTRATION, {
			expectedRPID: window.location.hostname,
			expectedOrigin: window.location.origin,
			credential,
		})

		return resp
	},

	authenticateAction: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}

		const options = await messanger.sendActionMessageFromPopup(AUTH_AUTHENTICATION_OPTIONS, null)

		const credential = await startAuthentication(options)

		const resp = await messanger.sendActionMessageFromPopup(AUTH_VERIFY_AUTHENTICATION, {
			expectedRPID: window.location.hostname,
			expectedOrigin: window.location.origin,
			credential,
		})

		return resp
	},

	authRegistrationOptions: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		return messanger.sendActionMessageFromPopup(AUTH_REGISTRATION_OPTIONS, null)
	},

	authVerifyRegistration: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		return messanger.sendActionMessageFromPopup(AUTH_VERIFY_REGISTRATION, null)
	},

	authAuthenticationOptions: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		return messanger.sendActionMessageFromPopup(AUTH_AUTHENTICATION_OPTIONS, null)
	},

	authVerifyAuthentication: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		return messanger.sendActionMessageFromPopup(AUTH_VERIFY_AUTHENTICATION, null)
	},

	sendResponseAction: async (action: string, data: any = {}) => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		await messanger.sendActionReply(action, data)
	},

	hasKeystoreAction: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		const hasKeystore = await messanger.sendActionMessageFromPopup(HAS, null)
		return !!hasKeystore
	},

	createWalletAction: async (words: string[], password: string) => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		const { seed, hasKeystore } = await messanger.sendActionMessageFromPopup(NEW, {
			words,
			password,
		})
		set(state => {
			state.hasKeystore = hasKeystore
			setMasterSeed(state, HDMasterSeed.fromSeed(Buffer.from(seed, 'hex')))
		})
	},

	unlockWalletAction: async (password: string) => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		const { seed, hasKeystore } = await messanger.sendActionMessageFromPopup(UNLOCK, password)

		set(state => {
			state.hasKeystore = hasKeystore
			setMasterSeed(state, HDMasterSeed.fromSeed(Buffer.from(seed, 'hex')))
		})
	},

	resetWalletAction: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		await messanger.sendActionMessageFromPopup(RESET, null)
		set(state => {
			Object.keys(defaultState).forEach(key => {
				state[key] = defaultState[key]
			})
			state.messanger = messanger
		})
	},

	lockAction: async () => {
		const { messanger } = get()
		if (!messanger) {
			throw new Error('Messanger not initialized!')
		}
		await messanger.sendActionMessageFromPopup(LOCK, null)
		set(state => {
			state.account = null
			state.masterSeed = null
		})
	},

	setMasterSeedAction: (seed: MasterSeed) => {
		set(state => setMasterSeed(state, seed))
	},

	setHasKeystoreAction: (hasKeystore: boolean) => {
		set(state => {
			state.hasKeystore = hasKeystore
		})
	},

	setMessangerAction: (messanger: MessageService) => {
		set(state => {
			state.messanger = messanger
		})
	},

	setHardwareWalletAction: (hardwareWallet: HardwareWalletT): void =>
		set(state => {
			state.hardwareWallet = hardwareWallet
		}),

	connectHWAction: () =>
		new Promise<void>((resolve, reject) => {
			set(async state => {
				try {
					await connectHW(state)
					resolve()
				} catch (error) {
					reject(error)
				}
			})
		}),

	sendAPDUAction: async (cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: number[]) => {
		const devices = await TransportNodeHid.list()
		if (devices.length === 0) {
			throw new Error('No device selected')
		}
		const transport = await TransportNodeHid.open(devices[0])
		try {
			const result = await transport.send(cla, ins, p1, p2, data, statusList)
			transport.close()
			return result
		} catch (e) {
			transport.close()
			throw e
		}
	},

	setHWPublicAddressesAction: (addresses: string[]) => {
		set(state => {
			state.hwPublicAddresses = addresses
		})
	},

	removeLastHWPublicAddressAction: () => {
		set(state => {
			if (state.hwPublicAddresses.length > 1) {
				state.hwPublicAddresses = state.hwPublicAddresses.slice(0, -1)
			}
		})
	},

	setPublicAddressesAction: (addresses: string[]) => {
		set(state => {
			state.publicAddresses = addresses
		})
	},

	removeLastPublicAddressAction: () => {
		set(state => {
			if (state.publicAddresses.length > 1) {
				state.publicAddresses = state.publicAddresses.slice(0, -1)
			}
		})
	},

	setAddressBookEntryAction: (address: string, settings: AddressBookEntry) => {
		set(state => {
			state.addressBook = { ...state.addressBook, [address]: { ...state.addressBook[address], ...settings } }
		})
	},

	removeAddressBookEntryAction: (address: string) => {
		set(state => {
			delete state.addressBook[address]
			state.addressBook = { ...state.addressBook }
		})
	},

	selectNetworkAction: (newIndex: number) => {
		set(state => selectNetwork(state, newIndex))
	},

	selectAccountAction: (newIndex: number) => {
		set(state => selectAccount(state, newIndex))
	},

	selectAccountForAddressAction: (address: string) => {
		set(state => {
			for (let i = 0; i < state.publicAddresses.length; i += 1) {
				if (state.publicAddresses[i] === address) {
					selectAccount(state, i)
					return
				}
			}
			for (let i = 0; i < state.hwPublicAddresses.length; i += 1) {
				if (state.hwPublicAddresses[i] === address) {
					selectAccount(state, i)
					return
				}
			}
		})
	},

	addNetworkAction: (id: NetworkID, url: URL) => {
		set(state => {
			if (!state.networks.filter(network => network.url === url)) {
				state.networks = [...state.networks, { id, url }]
			}
		})
	},

	setWalletUnclokTimeoutInMinutesAction: (timeoutInMinutes: number) => {
		set(state => {
			state.walletUnlockTimeoutInMinutes = timeoutInMinutes
		})
	},

	setAccountPanelExpandedAction: (expanded: boolean) => {
		set(state => {
			state.accountPanelExpanded = expanded
		})
	},

	setActiveAppAction: (activeApp: Array<string | number>) => {
		set(state => {
			state.activeApp = activeApp
		})
	},

	setActiveSlideIndexAction: (newIndex: number) => {
		set(state => {
			if (state.publicAddresses.length > 0) {
				newIndex = Math.min(state.publicAddresses.length, newIndex)
			} else if (newIndex > 1) {
				newIndex = 1
			}

			state.activeSlideIndex = newIndex
			if (newIndex < state.publicAddresses.length + state.hwPublicAddresses.length && newIndex >= 0) {
				selectAccount(state, newIndex)
			}
		})
	},

	approveWebsiteAction: (host: string) => {
		set(state => {
			state.approvedWebsites = { ...state.approvedWebsites, [host]: true }
		})
	},

	declineWebsiteAction: (host: string) => {
		set(state => {
			delete state.approvedWebsites[host]
			state.approvedWebsites = { ...state.approvedWebsites }
		})
	},

	addPendingActionAction: (id: string, request: any) => {
		set(state => {
			state.pendingActions = {
				...state.pendingActions,
				[id]: { payloadHex: JSONToHex(request), createdAt: new Date() },
			}
		})
	},

	removePendingActionAction: (id: string) => {
		set(state => {
			delete state.pendingActions[id]
			state.pendingActions = { ...state.pendingActions }
		})
	},
})
