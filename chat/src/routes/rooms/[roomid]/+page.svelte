<script lang="ts">
	import { Button, Input, Label } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import type { Tables } from '$lib/types/supabase';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { supabase } from '$lib/store';

	export let data: PageData;
	let message: string;
	let chats: Tables<'chats'>[] | null;

	onMount(async () => {
		await fetch();
	});

	const insert = async () => {
		if (!message && !data?.id) {
			return;
		}
		await get(supabase).from('chats').insert({
			room_id: data.id,
			message: message
		});
		await fetch();
	};

	const fetch = async () => {
		const response = await get(supabase).from('chats').select().eq('room_id', data.id);
		chats = response.data;
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
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
