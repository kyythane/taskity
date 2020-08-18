<script lang="ts">
    import TaskColumn from './TaskColumn.svelte';
    const todo = [...Array(75).keys()].map((i) => {
        return {
            id: `${i}`,
            title: `Todo ${i}`,
        };
    });
    const inProgress = [...Array(75).keys()].map((i) => {
        return {
            id: `${i + 75}`,
            title: `In Prog ${i}`,
        };
    });
    const done = [...Array(75).keys()].map((i) => {
        return {
            id: `${i + 150}`,
            title: `Done ${i}`,
        };
    });
</script>

<section class="flex h-full w-full p-12">
    <TaskColumn columnTitle="Todo" columnData="{todo}" />
    <TaskColumn columnTitle="In Progress" columnData="{inProgress}" />
    <TaskColumn columnTitle="Done" columnData="{done}" />
</section>
