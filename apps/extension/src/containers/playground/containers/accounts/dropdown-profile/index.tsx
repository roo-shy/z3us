import React from 'react'
import * as Avatar from '@radix-ui/react-avatar'
import { ChevronDownIcon, CardStackPlusIcon, DotFilledIcon, PersonIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { Button } from 'ui/src/components-v2/button'
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuArrow,
	DropdownMenuItemIndicator,
	DropdownMenuRightSlot,
} from 'ui/src/components-v2/dropdown-menu'

import './dropdown-profile.css'

export const DropdownProfile: React.FC = () => (
	<div className="z3-c-dropdown-profile">
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>
					<Avatar.Root className="z3-c-dropdown-profile__avatar">
						<Avatar.Image
							className="z3-c-dropdown-profile__avatar-image"
							src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80"
							alt="Colm Tuite"
						/>
						<Avatar.Fallback className="z3-c-dropdown-profile__avatar-fallback" delayMs={600}>
							CT
						</Avatar.Fallback>
						<span className="z3-c-dropdown-profile__connected" />
					</Avatar.Root>
					<ChevronDownIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="bottom" sideOffset={5} align="end" alignOffset={0}>
				<DropdownMenuLabel>
					Connected to{' '}
					<a href="https://ociswap.com/" target="_blank" rel="noreferrer">
						ociswap.com
					</a>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>Persona</DropdownMenuLabel>
				<DropdownMenuRadioGroup value="light" onValueChange={() => {}}>
					<DropdownMenuRadioItem value="light">
						<DropdownMenuItemIndicator>
							<DotFilledIcon />
						</DropdownMenuItemIndicator>
						Main persona
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">
						<DropdownMenuItemIndicator>
							<DotFilledIcon />
						</DropdownMenuItemIndicator>
						Degen persona
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>

				<DropdownMenuSeparator />
				<DropdownMenuLabel>Wallet</DropdownMenuLabel>

				<DropdownMenuRadioGroup value="light" onValueChange={() => {}}>
					<DropdownMenuRadioItem value="light">
						<DropdownMenuItemIndicator>
							<DotFilledIcon />
						</DropdownMenuItemIndicator>
						Main driver
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">
						<DropdownMenuItemIndicator>
							<DotFilledIcon />
						</DropdownMenuItemIndicator>
						Burner test wallet
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">
						<DropdownMenuItemIndicator>
							<DotFilledIcon />
						</DropdownMenuItemIndicator>
						Funny man&apos;s wallet
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>

				<DropdownMenuSeparator />
				<DropdownMenuItem>
					Lock wallet
					<DropdownMenuRightSlot>
						<LockClosedIcon />
					</DropdownMenuRightSlot>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Add new wallet
					<DropdownMenuRightSlot>
						<CardStackPlusIcon />
					</DropdownMenuRightSlot>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Add new persona
					<DropdownMenuRightSlot>
						<PersonIcon />
					</DropdownMenuRightSlot>
				</DropdownMenuItem>

				{/* <DropdownMenuSeparator /> */}
				{/* <DropdownMenuLabel>Theme</DropdownMenuLabel> */}
				{/**/}
				{/* <DropdownMenuRadioGroup value="light" onValueChange={() => {}}> */}
				{/* 	<DropdownMenuRadioItem value="light"> */}
				{/* 		<DropdownMenuItemIndicator> */}
				{/* 			<DotFilledIcon /> */}
				{/* 		</DropdownMenuItemIndicator> */}
				{/* 		Light */}
				{/* 	</DropdownMenuRadioItem> */}
				{/* 	<DropdownMenuRadioItem value="dark"> */}
				{/* 		<DropdownMenuItemIndicator> */}
				{/* 			<DotFilledIcon /> */}
				{/* 		</DropdownMenuItemIndicator> */}
				{/* 		Dark */}
				{/* 	</DropdownMenuRadioItem> */}
				{/* 	<DropdownMenuRadioItem value="system"> */}
				{/* 		<DropdownMenuItemIndicator> */}
				{/* 			<DotFilledIcon /> */}
				{/* 		</DropdownMenuItemIndicator> */}
				{/* 		System */}
				{/* 	</DropdownMenuRadioItem> */}
				{/* </DropdownMenuRadioGroup> */}
				<DropdownMenuArrow />
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
)
