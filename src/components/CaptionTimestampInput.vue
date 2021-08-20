<template>
  <v-col cols="4">
    <v-text-field class="caption-timestamp" filled outlined dense hide-details :label="label" :value="model"
                  :v-model="model"/>
  </v-col>
</template>

<script>
export default {
  name: 'CaptionTimestampInput',
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
