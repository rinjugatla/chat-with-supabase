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
	/**
	 * ランダムなID()
	 */
	let myid = uuid();
	/**
	 * 入力中のチャット
	 */
	let message: string;
	/**
	 * チャット履歴
	 */
	let chats: string[] = [];
	/**
	 * チャット通知
	 */
	let messageChannel: RealtimeChannel;
	/**
	 * 状態通知
	 */
	let stateChannel: RealtimeChannel;
	/**
	 * 入室中のユーザ数
	 */
	let joinedUsers: number = 0;
	/**
	 * 他ユーザの入力中カウント
	 */
	let otherInputCount = 0;
	/**
	 * 他のユーザが入力中か
	 */
	$: isInputOther = otherInputCount > 0;

	onMount(async () => {
		messageChannel = get(supabase).channel(`room-${data.id}-message`);
		stateChannel = get(supabase).channel(`room-${data.id}-state`);

		recieveMessage();
		recieveState();
		sendState();
	});

	onDestroy(async () => {
		await stateChannel?.untrack();
		await messageChannel?.unsubscribe();
		await stateChannel?.unsubscribe();
	});

	/**
	 * チャットを受信
	 */
	const recieveMessage = () => {
		messageChannel
			.on('broadcast', { event: 'send' }, (payload) => {
				chats.push(payload.payload.message);
				chats = chats;
			})
			.on('broadcast', { event: 'input' }, (payload) => {
				// 直接ユーザ入力を0, 1で管理するとsetTimeoutでラベルが即座に消えてしまうため
				// 入力に対してカウントしてラベルの表示を維持する
				otherInputCount += 1;
				setTimeout(() => {otherInputCount > 0 ? otherInputCount -= 1 : otherInputCount = 0}, 1000);
			})
			.subscribe();
	};

	/**
	 * ユーザの状態を受信
	 */
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

	/**
	 * ユーザの状態を送信(入室)
	 */
	const sendState = () => {
		stateChannel.track({
			user: myid,
			online_at: new Date().toISOString()
		});
	};

	/**
	 * メッセージの入力(状態の通知)
	 */
	const inputMessage = () => {
		if (!message && !data?.id) {
			return;
		}

		messageChannel.send({
			type: 'broadcast',
			event: 'input'
		});
	}

	/**
	 * メッセージの送信
	 */
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
	<div class:hidden={!isInputOther}>Input other...</div>
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
