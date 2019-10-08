<template>
  <FormBuilder :loadResource="loadResource"/>
</template>

<script>
import FormBuilder from '~/components/shared/form-builder/';
import factory from '~/factories';

const formHelper = factory('helper', 'form');

export default {
  components: {
    FormBuilder
  },
  methods: {
    loadResource(data) {
      this.$nuxt.$emit('changeBreadcrumbsData', formHelper.formBreadCrumbs(this.wmTranslate, data));
    }
  }
};
</script>
