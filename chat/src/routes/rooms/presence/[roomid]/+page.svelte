<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/store';
	import type { RealtimeChannel } from '@supabase/supabase-js';
	import { uuid } from '$lib';

	export let data: PageData;
	let myid = uuid();
	let message: string;
	let chats: string[] = [];
	let messageChannel: RealtimeChannel;
	let stateChannel: RealtimeChannel;
	let joinedUsers: number = 0;
	$: inputOther = inputOtherCount > 0;
	let inputOtherCount = 0;

	onMount(async () => {
		messageChannel = get(supabase).channel(`room-${data.id}-message`);
		stateChannel = get(supabase).channel(`room-${data.id}-state`);

		recieveMessage();
		recieveState();
		sendState();
	});

	onDestroy(async () => {
		await stateChannel?.untrack();
	});

	const recieveMessage = () => {
		messageChannel
			.on('broadcast', { event: 'send' }, (payload) => {
				console.log(payload);
				chats.push(payload.payload.message);
				chats = chats;
			})
			.on('broadcast', { event: 'input' }, (payload) => {
				inputOtherCount += 1;
				setTimeout(() => {inputOtherCount > 0 ? inputOtherCount -= 1 : inputOtherCount = 0}, 1000);
			})
			.subscribe();
	};

	const recieveState = () => {
		stateChannel
			.on('presence', { event: 'sync' }, () => {
				const newState = stateChannel.presenceState();
				joinedUsers = Object.keys(newState).length;
				// console.log('sync', newState);
			})
			.on('presence', { event: 'join' }, ({ key, newPresences }) => {
				// console.log('join', key, newPresences);
			})
			.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
				// console.log('leave', key, leftPresences);
			})
			.subscribe();
	};

	const sendState = () => {
		stateChannel.track({
			user: myid,
			online_at: new Date().toISOString()
		});
	};

	const inputMessage = () => {
		if (!message && !data?.id) {
			return;
		}

		messageChannel.send({
			type: 'broadcast',
			event: 'input'
		});
	}

	const sendMessage = async () => {
		if (!message && !data?.id) {
			return;
		}

		// 自分のチャットはpresenceで受信しないのでここで履歴に加える
		chats.push(message);
		chats = chats;

		messageChannel.send({
			type: 'broadcast',
			event: 'send',
			payload: { message: message }
		});
	};
</script>

<div>
	<div>Users: {joinedUsers}</div>
	<div>Current ID: {myid}</div>
	<div class:hidden={!inputOther}>Input other...</div>
</div>
<Button on:click={async () => await goto('/rooms')}>Back to rooms</Button>

<div class="m-4">
	<div class="flex">
		<div class="flex">
			<Label for="message" class="mx-2 content-center">message</Label>
			<Input type="text" id="message" placeholder="text" bind:value={message} on:keypress={inputMessage} required />
		</div>
		<Button
			type="submit"
			class="mx-2"
			on:click={async () => {
				await sendMessage();
			}}>Submit</Button
		>
	</div>
</div>

<div class="m-5">
	<table class="border-collapse border-spacing-6 border border-slate-500">
		<thead>
			<th class="px-10">message</th>
		</thead>
		<tbody>
			{#if chats}
				{#each chats as chat}
					<tr>
						<td>{chat}</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
