import React from 'react'
import { useImmer } from 'use-immer'
import { useSharedStore, useStore } from '@src/store'
import { useEventListener } from 'usehooks-ts'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow } from 'ui/src/components/tool-tip'
import { getShortAddress } from '@src/utils/string-utils'
import { Box, Flex, Text, StyledLink } from 'ui/src/components/atoms'
import { Pencil2Icon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons'
import { TrashIcon } from 'ui/src/components/icons'
import { EXPLORER_URL } from '@src/config'
import Button from 'ui/src/components/button'
import Input from 'ui/src/components/input'
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from 'ui/src/components/alert-dialog'
import { AddressBookEntry } from '@src/store/types'
import { AccountModal } from './account-modal'

export const Accounts: React.FC = () => {
	const { addToast } = useSharedStore(state => ({
		addToast: state.addToastAction,
	}))

	const { publicAddresses, setAddressBookEntry, removeAddress } = useStore(state => ({
		publicAddresses: state.publicAddresses,
		setAddressBookEntry: state.setPublicAddressAction,
		removeAddress: state.removePublicAddressesAction,
	}))
	const [state, setState] = useImmer({
		editing: '',
		tempEdit: '',
		isRemoveAccountDialogOpen: false,
	})

	const handleEdit = (entry: AddressBookEntry) => {
		setState(draft => {
			draft.editing = draft.editing === entry.address ? '' : entry.address
			draft.tempEdit = entry?.name
		})
	}

	const handleCancelEdit = () => {
		setState(draft => {
			draft.editing = ''
			draft.tempEdit = ''
		})
	}

	const handleCommitEdit = () => {
		setState(draft => {
			draft.editing = ''
		})
		setAddressBookEntry(state.editing, { name: state.tempEdit })
	}

	const editAccountName = (name: string) => {
		setState(draft => {
			draft.tempEdit = name
		})
	}

	const handleRemoveAccount = (idx: number) => {
		removeAddress(idx)

		setState(draft => {
			draft.isRemoveAccountDialogOpen = false
		})

		addToast({
			type: 'success',
			title: 'Succesfully removed account',
			duration: 5000,
		})
	}

	const handleOpenDialog = () => {
		setState(draft => {
			draft.isRemoveAccountDialogOpen = true
		})
	}

	const handleCloseDialog = () => {
		setState(draft => {
			draft.isRemoveAccountDialogOpen = false
		})
	}

	useEventListener('keypress', e => {
		if (e.code === 'Enter' && state.editing !== '') {
			handleCommitEdit()
		}
	})

	return (
		<Box css={{ px: '$3', py: '$3' }}>
			<Box>
				{Object.values(publicAddresses).map((entry, idx) => {
					const isEditing = entry.address === state.editing
					return (
						<Flex key={entry.address} align="center" css={{ flex: '1', position: 'relative' }}>
							<Flex align="center" css={{ flex: '1', height: '$9' }}>
								<Flex align="center" css={{ flex: '1', maxWidth: '240px' }}>
									{isEditing ? (
										<>
											<AccountModal address={entry.address} />
											<Box css={{ width: '202px', ml: '8px' }}>
												<Input
													selectOnMount
													type="text"
													value={state.tempEdit}
													placeholder="Enter account alias"
													onChange={(e: React.ChangeEvent<HTMLInputElement>): void => editAccountName(e.target.value)}
												/>
											</Box>
										</>
									) : (
										<>
											<AccountModal address={entry.address} />
											<Box css={{ maxWidth: '136px', pr: '$1', ml: '$2' }}>
												<Text truncate>{entry?.name}</Text>
											</Box>
											<Tooltip>
												<TooltipTrigger asChild>
													<Text truncate>
														<StyledLink
															css={{ color: '$txtMuted' }}
															underline
															target="_blank"
															href={`${EXPLORER_URL}accounts/${entry.address}`}
														>
															{getShortAddress(entry.address)}
														</StyledLink>
													</Text>
												</TooltipTrigger>
												<TooltipContent sideOffset={5}>
													<TooltipArrow />
													Go to explorer
												</TooltipContent>
											</Tooltip>
										</>
									)}
								</Flex>
							</Flex>
							<Flex align="center">
								{isEditing ? (
									<>
										<Button size="1" color="ghost" iconOnly onClick={() => handleCommitEdit()}>
											<CheckIcon />
										</Button>
										<Button size="1" color="ghost" iconOnly onClick={() => handleCancelEdit()}>
											<Cross2Icon />
										</Button>
									</>
								) : (
									<>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button size="1" color="ghost" iconOnly onClick={() => handleEdit(entry)}>
													<Pencil2Icon />
												</Button>
											</TooltipTrigger>
											<TooltipContent sideOffset={5}>
												<TooltipArrow />
												Edit alias
											</TooltipContent>
										</Tooltip>
										<AlertDialog open={state.isRemoveAccountDialogOpen}>
											<AlertDialogTrigger asChild>
												<Box>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button size="1" color="ghost" iconOnly onClick={handleOpenDialog}>
																<TrashIcon />
															</Button>
														</TooltipTrigger>
														<TooltipContent sideOffset={5}>
															<TooltipArrow offset={6} />
															Remove account
														</TooltipContent>
													</Tooltip>
												</Box>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<Box css={{ p: '$1' }}>
													<AlertDialogTitle>
														<Text medium size="5">
															Remove account?
														</Text>
													</AlertDialogTitle>
													<AlertDialogDescription>
														<Text size="3">
															Are you sure you want to remove this account from the wallet? You can restore it later by
															adding more accounts.
														</Text>
													</AlertDialogDescription>
													<Flex css={{ mt: '$2' }} justify="end" gap={2}>
														<AlertDialogAction asChild>
															<Button size="2" color="red" onClick={() => handleRemoveAccount(idx)}>
																Remove
															</Button>
														</AlertDialogAction>
														<AlertDialogCancel asChild>
															<Button size="2" color="tertiary" onClick={handleCloseDialog}>
																Cancel
															</Button>
														</AlertDialogCancel>
													</Flex>
												</Box>
											</AlertDialogContent>
										</AlertDialog>
									</>
								)}
							</Flex>
						</Flex>
					)
				})}
			</Box>
		</Box>
	)
}
