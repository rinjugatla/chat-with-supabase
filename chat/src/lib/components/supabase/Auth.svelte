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
		<form
			on:submit|preventDefault={async () => {
				if (signMode === 'in') {
					signInWithEmail();
				} else {
					signUpWithEmail();
				}
			}}
		>
			<div class="flex">
				<Label for="email" class="mx-2 content-center">Email</Label>
				<Input type="text" id="email" placeholder="Email" bind:value={email} required />
			</div>
			<div class="mt-2 flex">
				<Label for="password" class="mx-2 content-center">Password</Label>
				<Input
					type="password"
					id="password"
					placeholder="Password"
					bind:value={password}
					required
				/>
			</div>
			<div class="m-2 flex gap-2">
				<Button
					class="w-full"
					type="submit"
					on:click={() => {
						signMode = 'in';
					}}>Sign In</Button
				>
				<Button
					class="w-40"
					type="submit"
					color="green"
					on:click={() => {
						signMode = 'up';
					}}>Sign Up</Button
				>
			</div>
		</form>
	{/if}
</div>
