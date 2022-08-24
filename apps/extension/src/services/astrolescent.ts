import { Action } from '@src/types'
import BigNumber from 'bignumber.js'

export const PoolName = 'Astrolescent'

export type Token = {
	symbol: string
	rri: string
}

export type TokensResponse = Array<Token>

export type SwapResponse = {
	inputTokens?: number
	outputTokens?: number
	priceImpact: number
	swapFee: number
	transactionData: {
		actions: Array<Action>
		encryptMessage: boolean
		message: string
	}
}

export class AstrolescentService {
	private baseURL: string = 'https://api.astrolescent.workers.dev'

	private options: RequestInit = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}

	getTokens = async (): Promise<TokensResponse> => {
		const response = await fetch(`${this.baseURL}/tokens}`, this.options)
		if (response.status !== 200) {
			throw new Error(`Invalid request: ${response.status} received`)
		}

		return response.json()
	}

	getSwap = async (
		fromAddress: string,
		tokenIn: string,
		tokenOut: string,
		amount: BigNumber,
		type: 'in' | 'out' = 'out',
	): Promise<SwapResponse> => {
		const url = new URL(`${this.baseURL}/swap`)
		url.searchParams.set('tokenIn', tokenIn)
		url.searchParams.set('tokenOut', tokenOut)
		url.searchParams.set('fromAddress', fromAddress)
		switch (type) {
			case 'in':
				url.searchParams.set('tokenInAmount', amount.toString())
				break
			case 'out':
			default:
				url.searchParams.set('tokenOutAmount', amount.toString())
				break
		}
		const path = url.toString()

		const response = await fetch(path, this.options)
		if (response.status !== 200) {
			throw new Error(`Invalid request: ${response.status} received`)
		}

		return response.json()
	}
}

const service = new AstrolescentService()
export default service
