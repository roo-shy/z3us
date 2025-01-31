/* eslint-disable */
import React, { useState } from 'react'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { PlusIcon, MagnifyingGlassIcon, ArrowLeftIcon } from 'ui/src/components/icons'
import { AnimatedPage } from '@src/containers/playground/components/animated-route'
import { AnimatePresence } from 'framer-motion'
import { Routes, Route, useLocation, Link as LinkRouter, useNavigate } from 'react-router-dom'
import { AccountsList } from '@src/containers/playground/containers/accounts/accounts-list'
import { AccountSwitcher } from '@src/containers/playground/containers/accounts/account-switcher'
import { AccountActivity } from '@src/containers/playground/containers/accounts/account-activity'
import { useAccountParams } from '@src/containers/playground/hooks/use-account-params'
import { Button } from 'ui/src/components-v2/button'
import { Input } from 'ui/src/components-v2/input'
// inone { Button as ButtonLink } from '@src/components/button'
import { Box } from 'ui/src/components-v2/box'
import { Text } from 'ui/src/components-v2/typography'
import { Link } from '@src/components/link'

import * as styles from './accounts-home.css'

export const AccountsHome = () => {
	const location = useLocation()
	const [view, setView] = useState<string>('list')

	return (
		<Box
			display="flex"
			justifyContent="center"
			paddingX="large"
			paddingBottom="xxlarge"
			paddingTop="xxlarge"
			height="full"
		>
			<Box width="full" maxWidth="xxlarge">
				<Box display="flex" gap="xlarge" height="full">
					<Box
						background="backgroundSecondary"
						boxShadow="shadowMedium"
						borderRadius="xlarge"
						flexGrow={1}
						overflow="hidden"
						className={styles.leftPanel}
					>
						<AccountsRouteWrapper />
						<Box position="relative">
							<AnimatePresence initial={false}>
								<Routes location={location} key={location.pathname}>
									<Route
										path="/:account"
										element={
											<AnimatedPage>
												<AccountsIndexAssets />
											</AnimatedPage>
										}
									/>
									<Route
										path="/:account/:assetType"
										element={
											<AnimatedPage>
												<AccountsList view={view as any} />
											</AnimatedPage>
										}
									/>
									<Route
										path="/:account/:assetType/:asset"
										element={
											<AnimatedPage>
												<AccountsList view={view as any} />
											</AnimatedPage>
										}
									/>
								</Routes>
							</AnimatePresence>
						</Box>
					</Box>
					<Box
						background="backgroundSecondary"
						boxShadow="shadowMedium"
						borderRadius="xlarge"
						className={styles.rightPanel}
					>
						<AccountSwitcher />
						<Box paddingX="large" paddingTop="xlarge" paddingBottom="small" className={styles.recentActivityWrapper}>
							<Box display="flex" alignItems="center" position="relative">
								<Box flexGrow={1}>
									<Text size="large" weight="medium" color="strong">
										Recent activity
									</Text>
								</Box>
								<Button
									styleVariant="ghost"
									sizeVariant="small"
									onClick={() => {
										console.log(99, 'search')
									}}
									iconOnly
								>
									<MagnifyingGlassIcon />
								</Button>
							</Box>
						</Box>
						<AccountActivity />
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

export const AccountsRouteWrapper = () => {
	const { account, assetType, asset } = useAccountParams()
	const navigate = useNavigate()
	return (
		<Box position="relative">
			<Box paddingX="xlarge" paddingTop="xlarge">
				<Box display="flex" alignItems="center">
					<Button
						styleVariant="ghost"
						sizeVariant="small"
						onClick={() => {
							navigate(-1)
						}}
					>
						<ArrowLeftIcon />
						Go Back
					</Button>
					<Box paddingX="small">
						<Text size="medium">&middot;</Text>
					</Box>
					<Text size="medium">Account balance ({account})</Text>
				</Box>
				<Text weight="strong" size="xxxlarge" color="strong">
					$40,206.25
				</Text>
			</Box>
			<Box paddingX="xlarge" paddingBottom="xlarge" paddingTop="large" display="flex" alignItems="center">
				<Box flexGrow={1} display="flex" alignItems="center">
					{asset ? (
						<Text size="large" color="strong" weight="medium">
							{asset}
						</Text>
					) : (
						<Text size="large" color="strong" weight="medium">
							{assetType}
						</Text>
					)}
				</Box>
				<Box display="flex" gap="small" paddingBottom="large">
					<Input placeholder="Search the tokens" />
					<Button
						styleVariant="ghost"
						iconOnly
						onClick={() => {
							console.log(99, 'search')
						}}
					>
						<MagnifyingGlassIcon />
					</Button>
					<Button styleVariant="secondary">
						<MixerHorizontalIcon />
						Apply filter
					</Button>
				</Box>
			</Box>
		</Box>
	)
}

export const AccountsIndexAssets = () => {
	return (
		<>
			<Box paddingBottom="xlarge">
				<Box className={styles.indexAssetsWrapper}>
					{[{ name: 'Tokens' }, { name: 'NFTs' }, { name: 'LP Tokens' }, { name: 'Badges' }].map(({ name }) => (
						<Box key={name} className={styles.indexAssetWrapper}>
							<Link to="/accounts/all/tokens" underline="never" className={styles.indexAssetLinkRow}>
								<Box flexGrow={1} borderTop={1} borderStyle="solid" borderColor="borderDivider" paddingY="medium">
									<Box display="flex" alignItems="center">
										<Text size="large" color="strong" weight="medium">
											{name}
										</Text>
										<Box paddingLeft="xsmall">
											<Text size="large" weight="medium">
												(12)
											</Text>
										</Box>
									</Box>
									<Box display="flex" alignItems="center">
										<Text size="medium" color="strong" weight="medium">
											$12,401
										</Text>
										<Box paddingLeft="xsmall">
											<Text size="small" color="green">
												+1.23%
											</Text>
										</Box>
									</Box>
								</Box>
							</Link>
							<Box className={styles.indexAssetRowOverlay}>
								<Box display="flex" alignItems="center" marginRight="large">
									<Text size="medium" color="strong" weight="medium">
										+7
									</Text>
									{/* <Box paddingLeft="xsmall"> */}
									{/* 	<ButtonLink styleVariant="ghost" sizeVariant="small" iconOnly to="/accounts/all/tokens"> */}
									{/* 		<PlusIcon /> */}
									{/* 	</ButtonLink> */}
									{/* </Box> */}
								</Box>
								<Link to="/accounts/all/tokens" className={styles.indexAssetCircle}>
									<Box />
								</Link>
								<Link to="/accounts/all/tokens" className={styles.indexAssetCircle}>
									<Box />
								</Link>
								<Link to="/accounts/all/tokens" className={styles.indexAssetCircle}>
									<Box />
								</Link>
								<Link to="/accounts/all/tokens" className={styles.indexAssetCircle}>
									<Box />
								</Link>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</>
	)
}
