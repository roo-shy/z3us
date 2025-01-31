import React, { useState, useEffect } from 'react'
import { CheckIcon } from 'ui/src/components/icons'
import { lightThemeClass, darkThemeClass } from 'ui/src/components-v2/system/theme.css'
import { Box } from 'ui/src/components-v2/box'
import { Text } from 'ui/src/components-v2/typography'
import { AnimatePresence } from 'framer-motion'
import { AnimatedPage } from '@src/containers/playground/components/animated-route'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { Accounts } from '../accounts'

import * as styles from './app.css'

const NotFound404 = () => (
	<Box padding="large">
		<Box className={styles.teststyle} paddingTop="large" display="flex" flexDirection="column">
			<Text size="code">code</Text>
			<Text size="xsmall">xsmall</Text>
			<Text size="small">small</Text>
			<Text size="medium">medium</Text>
			<Text size="large">large</Text>
			<Text size="xlarge">xlarge</Text>
			<Text size="xxlarge">xxlarge</Text>
			<Text size="xxxlarge" color="strong">
				xxxlarge strong
			</Text>
		</Box>
	</Box>
)

export const TempNav: React.FC = () => {
	const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false)
	const [isMounted, setIsMounted] = useState<boolean>(false)

	useEffect(() => {
		const element = window.document.body
		const match = window.matchMedia('(prefers-color-scheme: dark)')
		const isDarkMode = match.matches

		if (isDarkTheme) {
			element.classList.add(darkThemeClass)
			element.classList.add('dark')
			element.classList.remove('light')
			element.classList.remove(lightThemeClass)
		} else {
			element.classList.remove(darkThemeClass)
			element.classList.remove('dark')
			element.classList.add('light')
			element.classList.add(lightThemeClass)
		}

		if (!isMounted) {
			if (isDarkMode) {
				element.classList.add(darkThemeClass)
				element.classList.add('dark')
				element.classList.remove('light')
				element.classList.remove(lightThemeClass)
				setIsDarkTheme(true)
			}
			setIsMounted(true)
		}
	}, [isDarkTheme])

	return (
		<Box
			display="flex"
			position="fixed"
			className={styles.tempNav}
			padding="small"
			gap="medium"
			style={{ opacity: '0.2' }}
		>
			<Link to="/">Home</Link>
			<Link to="/accounts">Accounts</Link>
			<Link to="/onboard">Onboarding</Link>
			<Link to="/hw">HW (hardware wallet)</Link>
			<Link to="/cred">Credentials</Link>
			<button onClick={() => setIsDarkTheme(!isDarkTheme)} type="button">
				<CheckIcon />
			</button>
		</Box>
	)
}

export const App: React.FC = () => {
	const location = useLocation()
	const locationArr = location.pathname?.split('/') ?? []

	return (
		<div className={styles.container}>
			<TempNav />
			<AnimatePresence initial={false}>
				<Routes location={location} key={locationArr[1]}>
					{['/', '/accounts'].map(path => (
						<Route
							key="Accounts" // optional: avoid full re-renders on route changes
							path={path}
							element={<Navigate to="/accounts/all" />}
						/>
					))}
					<Route
						path="/accounts/*"
						element={
							<AnimatedPage>
								<Accounts />
							</AnimatedPage>
						}
					/>
					<Route
						path="/page2/*"
						element={
							<AnimatedPage>
								<Link to="../page1">Next page</Link>
							</AnimatedPage>
						}
					/>
					<Route
						path="*"
						element={
							<AnimatedPage>
								<NotFound404 />
							</AnimatedPage>
						}
					/>
				</Routes>
			</AnimatePresence>
		</div>
	)
}
