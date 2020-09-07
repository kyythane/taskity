<script lang="ts">
    import { DropGroup } from 'svelte-reactive-dnd';

    import TaskColumn from './TaskColumn.svelte';
    import { selectedTasks } from './stores';
    const num = 50;
    let todo = [...Array(num).keys()].map((i) => {
        return {
            id: `${i}`,
            title: `Todo, ID: ${i}`,
            labels: [],
        };
    });
    let inProgress = [...Array(num).keys()].map((i) => {
        return {
            id: `${num + i}`,
            title: `In Progress, ID: ${num + i}`,
            labels: [],
        };
    });
    let done = [...Array(num).keys()].map((i) => {
        return {
            id: `${2 * num + i}`,
            title: `Done, ID: ${2 * num + i}`,
            labels: [],
        };
    });
</script>

<!-- <section class="flex h-full w-full p-12"> -->
<DropGroup
    on:dragcomplete="{({ detail }) => {
        console.log(detail);
    }}"
>
    <section class="h-full w-full p-12">
        <TaskColumn
            columnTitle="Todo"
            columnData="{todo}"
            on:itemdroppedin="{({ detail }) => (todo = detail.listSnapshot)}"
            on:itemdraggedout="{({ detail }) => (todo = detail.listSnapshot)}"
        />
        <TaskColumn
            columnTitle="In Progress"
            columnData="{inProgress}"
            on:itemdroppedin="{({ detail }) => (inProgress = detail.listSnapshot)}"
            on:itemdraggedout="{({ detail }) => (inProgress = detail.listSnapshot)}"
        />
        <TaskColumn
            columnTitle="Done"
            columnData="{done}"
            on:itemdroppedin="{({ detail }) => (done = detail.listSnapshot)}"
            on:itemdraggedout="{({ detail }) => (done = detail.listSnapshot)}"
        />
    </section>
</DropGroup>
