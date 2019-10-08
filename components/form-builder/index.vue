<template>
  <ps-card
    :title="wmTranslate('FORMS.Form_Generator', 'Form Generator')"
    type="table">
    <template slot="card-header-controls">
      <div class="controls">
        <el-button
          size="small"
          style="margin-right: 5px"
          @click.native="loadFormsList">
          {{ wmTranslate('FORMS.Cancel', 'Cancel') }}
        </el-button>
        <el-button
          :loading="isSaving"
          size="small"
          type="primary"
          style="margin-right: 5px"
          @click.native="saveForm">
          {{ wmTranslate('FORMS.Save', 'Save') }}
        </el-button>
      </div>
    </template>
    <template slot="card-body">
      <wm-loader
        v-if="isLoading"
        style="padding:20px;"/>
      <div v-else>
        <el-form
          slot="card-body"
          label-position="top"
          @submit.native.prevent="saveForm">
          <div class="form-container">
            <e-messages
              v-if="errors.length"
              :errors="errors"/>
            <el-form-item
              :rules="rules.title"
              :label="wmTranslate('FORMS.Title', 'Title')">
              <el-input v-model="form.title"/>
            </el-form-item>
            <el-form-item :label="wmTranslate('FORMS.Description', 'Description')">
              <el-input
                v-model="form.description"
                :row="3"
                type="textarea"
                clearable/>
            </el-form-item>
          </div>
        </el-form>
        <div class="form-builder-container form-builder-fluid">
          <FormType
            :fields="fields"
            :addQuestion="addQuestion"
            :addTitleDescription="addTitleDescription"
            @copyQuestion="copyQuestion"
            @removeQuestion="removeQuestion"/>
        </div>
      </div>
    </template>
  </ps-card>
</template>
<script>
import { mapActions } from 'vuex';
import factory from '~/factories';
import FormType from '~/components/shared/form-builder/FormType';

const { deleteFormField, addFormTemplate } = factory('repository', 'form');
const formHelper = factory('helper', 'form');

export default {
  components: {
    FormType
  },
  props: {
    loadResource: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      isSaving: false,
      form: {
      },
      rules: {
        title: [{ required: true }],
      },
      fields: [],
      options: [],
      errors: [],
      form_type: 'add',
      resource: null,
      counter: 0
    };
  },
  mounted() {
    this.populateForm();
  },
  destroyed() {
    this.fields = [];
    this.options = [];
  },
  methods: {
    ...mapActions({
      store: 'forms/addForm',
      update: 'forms/updateForm',
      get: 'forms/get'
    }),
    async populateForm() {
      this.isLoading = true;
      const formId = this.$route.query.id;
      if (formId) {
        const { success, data } = await this.get(formId);
        const formData = success ? data : {};
        // check if edited/duplicated has existing form field
        this.form_type = 'update';
        this.loadResource(formData);
        const formFieldsData = formData && formData.fields;
        const existingFormdata = formFieldsData && formFieldsData.length !== 0 ? formFieldsData : [];

        this.form.id = formData.id;
        this.form.title = formData.title;
        this.form.description = formData.description;
        const { resource, resource_id } = this.$route.params;
        const resourceParams = resource ? { resource_id, resource_type: resource } : null;
        this.resource = formData.resource || resourceParams;
        // check if there are empty fields
        const checkedFields = existingFormdata
          .filter(({field_type}) => field_type)
          .map((item) => {
            return {
              ...item,
              required: !!item.required,
            };
          });
        this.fields = checkedFields.length !== 0 ? checkedFields : [formHelper.defaultField];
      } else {
        this.addQuestion();
      }
      this.isLoading = false;
    },
    addQuestion() {
      this.fields.push({
        title: '',
        value_type: 'text',
        field_type: 'question',
        required: false
      });
    },
    addTitleDescription() {
      this.fields.push({
        subtitle: '',
        text_area: '',
        field_type: 'title_description'
      });
    },
    copyQuestion(question) {
      const clonedQuestion = this.$lodash.cloneDeep(question);
      const { options } = clonedQuestion;
      const clonedOptions = options ? options.map((option) => {
        option.id = '';
        return option;
      }) : [];
      this.fields.push({...clonedQuestion, id: '', options: clonedOptions});
    },
    removeQuestion(index, { id }) {
      if (this.form_type === 'update' && id) {
        this.showConfirmDialog(async () => {
          this.fields.splice(index, 1);
          await deleteFormField(id);
        }, this.wmTranslate('FORMS.Are you sure you want to delete this question?'), this.wmTranslate('FORMS.Remove_Question'));
      } else {
        this.fields.splice(index, 1);
      }
      if (this.fields.length === 0) {
        this.addQuestion();
      }
    },
    async saveForm() {
      if (!this.isSaving) {
        this.isSaving = true;
        let fields = this.fields.map((item, index) => {
          if (!item.id && !item.title && !item.options && item.value_type === 'text' && item.field_type === 'question' && !item.required) return null;
          const fieldLabel = (item.title || item.subtitle) ? (item.title || item.subtitle) : '';
          const fieldModel = this.generateModel(fieldLabel, item.value_type, index);
          return {
            ...item,
            field_type: item.field_type, // question || title_description
            value_type: item.value_type, // checkbox, radio, etc
            title: fieldLabel,
            model: fieldModel,
            options: item.options ? item.options.map((option) => {
              option.id = option.id || '';
              return option;
            }) : [],
            // placeholder: fieldLabel,
            arrangement_number: index
          };
        });
        // return only valid fields
        fields = fields.filter(field => field);
        this.form.fields = fields;
        const { copy, id } = this.$route.query;
        !this.resource ? this.sendForm(copy, id) : this.sendResourceForm(copy);
      }
    },
    generateModel(label, valueType, index) {
      if (!valueType) return '';
      const formattedLabel = `${label.toLowerCase().split(' ').join('_')}_${index}`;
      return valueType === 'date' ? `new_date_${formattedLabel}` : formattedLabel;
    },
    async sendForm(copy, id) {
      const request = (!copy && id) ? this.update : this.store;
      const response = await request(this.form);
      this.handleResponse(response);
    },
    async sendResourceForm(copy) {
      const { resource_type, resource_id } = this.resource;
      const details = {
        ...this.form,
        is_filled_out: 0,
        resource: resource_type,
        resource_id
      };
      const response = copy ? await addFormTemplate(details) : await this.update(this.form);
      this.handleResponse(response);
    },
    handleResponse(response) {
      const { success, message } = response;
      this.isSaving = false;
      success ? this.loadFormsList() : this.handleError(message);
    },
    loadFormsList() {
      const resourcePathName = this.$route.path.split('/')[2];
      const url = (this.resource && resourcePathName !== 'forms') ? `/dashboard/${this.resource.resource_type}s/${this.resource.resource_id}/forms` : '/dashboard/forms';
      this.$nuxt.$router.push(url);
    }
  }
};
</script>

<style lang="sass" scoped>
  .form-builder-container
    margin: auto
    position: relative
    padding: 10px

  .form-builder-fluid
    width: 770px

  .form-builder-buttons
    margin-top: 20px
    margin-bottom: 10px

  .form-container
    margin: 20px
    border-bottom: 1px dashed #e5e6e7
    padding:
      bottom: 10px

  @media (max-width: 1030px)
    .form-builder-fluid
      width: 100%
</style>
