<template>
  <v-col lg="4" md="4" sm="4" cols="12">
    <v-text-field class="caption-timestamp" :label="label" filled outlined dense hide-details :v-model="model"/>
  </v-col>
</template>

<script>
export default {
  name: 'TranslationTimestampInput',
  props: {
    label: {
      type: String,
      required: true
    },
    model: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>

</style>
