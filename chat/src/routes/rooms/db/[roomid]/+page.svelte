<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { Tables } from '$lib/types/supabase';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/store';
	import { supabaseUser } from '$lib/index';

	export let data: PageData;
	let message: string;
	let chats: Tables<'chats'>[] | null;
	let myId: string | undefined = undefined;

	onMount(async () => {
		myId = (await supabaseUser()).data.user?.id;

		await fetch();
		listen();
	});

	const listen = () => {
		get(supabase)
			.channel('chats-change')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'chats'
				},
				(payload) => {
					const newChat = payload.new as Tables<'chats'>;
					const newChats = chats ? [...chats, newChat] : [newChat];
					chats = newChats.sort((a, b) => a.id - b.id);
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'chats'
				},
				(payload) => {
					const deletedId = payload.old.id;
					chats = chats ? chats?.filter(chat => chat.id !== deletedId): [];
				}
			)
			.subscribe();
	};

	const insert = async () => {
		if (!message && !data?.id) {
			return;
		}

		await get(supabase)
			.from('chats')
			.insert({
				room_id: data.id,
				user_id: (await supabaseUser()).data.user?.id,
				message: message
			});
	};

	const fetch = async () => {
		const response = await get(supabase).from('chats').select().eq('room_id', data.id);
		chats = response.data;
	};

	const deleteChat = async (id: number) => {
		if (!myId) {
			return;
		}

		await get(supabase).from('chats').delete().eq('user_id', myId).eq('id', id);
	};
</script>

<Button on:click={async () => await goto('/rooms')}>Back to rooms</Button>

<div class="m-4">
	<div class="flex">
		<div class="flex">
			<Label for="message" class="mx-2 content-center">message</Label>
			<Input type="text" id="message" placeholder="text" bind:value={message} required />
		</div>
		<Button
			type="submit"
			class="mx-2"
			on:click={async () => {
				await insert();
			}}>Submit</Button
		>
	</div>
</div>

<div class="m-5">
	<table class="border-collapse border-spacing-6 border border-slate-500">
		<thead>
			<th class="px-4">id</th>
			<th class="px-5">user_id</th>
			<th class="px-5">room_id</th>
			<th class="px-10">message</th>
			<th>created_at</th>
			<th>Delete</th>
		</thead>
		<tbody>
			{#if chats}
				{#each chats as chat}
					<tr>
						<td>{chat.id}</td>
						<td>{chat.user_id}</td>
						<td>{chat.room_id}</td>
						<td>{chat.message}</td>
						<td>{chat.created_at}</td>
						<td>
							{#if chat.user_id === myId}
								<Button
									color="red"
									on:click={async () => {
										deleteChat(chat.id);
									}}>Delete</Button
								>
							{/if}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
