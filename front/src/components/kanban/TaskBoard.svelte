<script lang="ts">
    import TaskColumn from './TaskColumn.svelte';
    import { selectedTasks } from './stores';
    let todo = [...Array(1000).keys()].map((i) => {
        return {
            id: `${i}`,
            title: `Todo, ID: ${i}`,
            labels: [],
        };
    });
    let inProgress = [...Array(1000).keys()].map((i) => {
        return {
            id: `${1000 + i}`,
            title: `In Progress, ID: ${1000 + i}`,
            labels: [],
        };
    });
    let done = [...Array(1000).keys()].map((i) => {
        return {
            id: `${2000 + i}`,
            title: `Done, ID: ${2000 + i}`,
            labels: [],
        };
    });
</script>

<section class="flex h-full w-full p-12">
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
