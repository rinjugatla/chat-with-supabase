<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import { session, supabase } from '$lib/store';
	import type { Session } from '@supabase/supabase-js';
	import { createEventDispatcher, onMount } from 'svelte';
	import { get } from 'svelte/store';

	const dispatch = createEventDispatcher();

    let email = '';
	let password = '';
	let localSession: Session | null = null;
    /**
	 * 現在サインイン中か
	 */
	$: isSignIned = !!localSession;
	/**
	 * サインインモード
	 */
	let signMode: 'in' | 'up' = 'in';

	onMount(async () => {
		const { data, error } = await get(supabase).auth.getSession();
		if (error) {
			return;
		}

		storeSession(data.session);
	});

	const storeSession = (_session: Session | null) => {
		localSession = _session;
		session.set(_session);

		if (_session) {
			dispatch('signin');
		} else {
			dispatch('signout');
		}
	};

	/**
	 * サインイン
	 */
	const signInWithEmail = async () => {
		const { data, error } = await get(supabase).auth.signInWithPassword({
			email: email,
			password: password
		});

		if (error) {
			alert(error.message);
			return;
		}

		storeSession(data.session);
	};

	/**
	 * サインアップ
	 */
	const signUpWithEmail = async () => {
		const { data, error } = await get(supabase).auth.signUp({
			email: email,
			password: password
		});

		if (error) {
			alert(error.message);
			return;
		}

		const isVerified = data.session;
		if (!isVerified) {
			alert('Please check your inbox for email verification!');
			return;
		}

		storeSession(data.session);
	};

	/**
	 * サインアウト
	 */
	const signOut = async () => {
		const { error } = await get(supabase).auth.signOut();
		if (error) {
			alert(error.message);
			return;
		}

		storeSession(null);
	};
</script>

<div class="m-5">
	{#if isSignIned}
		<Button
			on:click={async () => {
				await signOut();
			}}>Signout</Button
		>
	{:else}
		<div class="flex"></div>
		{#if signMode === 'in'}
			<form
				on:submit|preventDefault={async () => {
					signInWithEmail();
				}}
			>
				<div class="flex">
					<Label for="email" class="mx-2 content-center">Email address</Label>
					<Input type="text" id="email" placeholder="Email address" bind:value={email} required />
				</div>
				<div class="flex">
					<Label for="password" class="mx-2 content-center">Your Password</Label>
					<Input
						type="password"
						id="password"
						placeholder="Your Password"
						bind:value={password}
						required
					/>
				</div>
				<div class="flex gap-2">
					<Button type="submit">Sign In</Button>
					<Button
						color="green"
						on:click={() => {
							signMode = 'up';
						}}>Sign Up</Button
					>
				</div>
			</form>
		{:else}
			<form
				on:submit|preventDefault={async () => {
					await signUpWithEmail();
				}}
			>
				<div class="flex">
					<Label for="email" class="mx-2 content-center">Email address</Label>
					<Input type="text" id="email" placeholder="Email address" bind:value={email} required />
				</div>
				<div class="flex">
					<Label for="password" class="mx-2 content-center">Create Password</Label>
					<Input
						type="password"
						id="password"
						placeholder="Create Password"
						bind:value={password}
						required
					/>
				</div>
				<div class="flex gap-2">
					<Button type="submit">Sign Up</Button>
					<Button
						color="green"
						on:click={() => {
							signMode = 'in';
						}}>Sign In</Button
					>
				</div>
			</form>
		{/if}
	{/if}
</div>
