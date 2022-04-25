import { Runtime } from 'webextension-polyfill'
import { generateId } from '@src/utils/generate-id'

export const WINDOW_EVENT_NAME = 'message'
export const PORT_NAME = 'z3us'

export const TARGET_INPAGE = 'z3us-inpage'
export const TARGET_POPUP = 'z3us-popup'
export const TARGET_BACKGROUND = 'z3us'

export type MessageResponse = { code: number; error?: any; [key: string]: any }

export class MessageService {
	private name: string

	private port?: Runtime.Port

	private window?: Window

	private messageHandlers: {
		[key: string]: any
	} = {}

	constructor(name: string, port: Runtime.Port = null, window: Window = null) {
		this.name = name
		this.port = port
		this.window = window
		if (this.port) {
			this.port.onMessage.addListener(this.onMessage)
		}
		if (this.window) {
			this.window.addEventListener(WINDOW_EVENT_NAME, this.onWindowMessage, false)
		}
	}

	sendActionMessageFromPopup = async (action: string, payload: any) =>
		this.sendMessage(TARGET_POPUP, TARGET_BACKGROUND, action, payload)

	sendActionMessageFromInPage = async (action: string, payload: any) =>
		this.sendMessage(TARGET_INPAGE, TARGET_BACKGROUND, action, payload)

	sendMessage = async (from: string, to: string, action: string, payload: any = {}) => {
		if (this.port) {
			return this.backgroundActionFromPort(from, to, action, payload)
		}
		if (this.window) {
			return this.backgroundActionFromWindow(from, to, action, payload)
		}
		return null
	}

	sendActionReply = async (action: string, data: any = {}) => {
		this.sendReply(TARGET_BACKGROUND, action, data)
	}

	sendReply = async (to: string, action: string, data: any = {}) => {
		if (this.port) {
			this.port.postMessage({ target: to, source: TARGET_POPUP, action, ...data })
		}
		if (this.window) {
			this.window.postMessage({ target: to, source: TARGET_POPUP, action, ...data }, '*')
		}
	}

	private onMessage = message => {
		if (!message.id) {
			return
		}
		const handler = this.messageHandlers[message.id]
		if (handler) {
			handler(message)
		}
	}

	private onWindowMessage = (event: WindowEventMap[typeof WINDOW_EVENT_NAME]) => {
		if (event.source !== this.window) {
			return
		}
		this.onMessage(event.data)
	}

	private backgroundActionFromWindow = async (from: string, to: string, action: string, payload: any = {}) => {
		if (!this.window) {
			return null
		}

		const messageId = `${action}-${generateId()}`
		const promise = new Promise<MessageResponse>(resolve => {
			this.messageHandlers[messageId] = message => {
				if (message.target !== from) {
					return
				}
				if (!message.id || message.id !== messageId) {
					return
				}

				resolve(message.response)
				delete this.messageHandlers[message.id]
			}
		})

		this.window.postMessage({ id: messageId, target: to, source: from, action, payload }, '*')

		const response = await promise
		if (response?.error) {
			throw response.error
		}
		if (response?.code && response.code !== 200) {
			throw new Error(`Unknown error (code ${response.code})`)
		}

		return response
	}

	private backgroundActionFromPort = async (from: string, to: string, action: string, payload: any = {}) => {
		if (!this.port) {
			return null
		}

		const messageId = `${action}-${generateId()}`
		const promise = new Promise<MessageResponse>(resolve => {
			this.messageHandlers[messageId] = message => {
				if (message.target !== from) {
					return
				}
				if (!message.id || message.id !== messageId) {
					return
				}

				resolve(message.response)
				delete this.messageHandlers[message.id]
			}
		})

		this.port.postMessage({ id: messageId, target: to, source: from, action, payload })

		const response = await promise
		if (response?.error) {
			throw response.error
		}
		if (response?.code && response.code !== 200) {
			throw new Error(`Unknown error (code ${response.code})`)
		}

		return response
	}
}
