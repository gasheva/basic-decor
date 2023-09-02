<script setup lang="ts">

</script>

<template>
<div class="card me-1 mb-1" :class="$style.card">
    <div class="card-body d-flex flex-column">
        <slot></slot>
    </div>
</div>
</template>

<style module>
.card {
    max-width: 19rem;
    min-width: 18rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* smooth animation */
    transform: scale(1);
    box-shadow: none;
    z-index: 1;
}
.card:hover {
    transform: scale(1.05); /* makes the card a little bit closer */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* adds shadow */
    z-index: 2;
}
</style>