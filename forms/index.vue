<template>
  <div class="container">
    <el-row :gutter="20">
      <wm-col :cols="[24,24,16,16]">
        <ps-card
          :title="wmTranslate('FORMS.Forms', 'Forms')"
          type="tab">
          <template slot="card-optional-header">
            <div class="wm-custom-tabs hidden-xs-only">
              <el-tabs
                :before-leave="changeTab">
                <el-tab-pane
                  v-for="({ id, label }, index) in tabs"
                  :key="index"
                  :label="label"/>
              </el-tabs>
            </div>
          </template>
          <template slot="card-header-controls">
            <div class="controls flex-container align-items-center">
              <el-button
                type="primary"
                size="mini"
                @click.native="goToFormBuilder">
                {{ wmTranslate('FORMS.New_template', 'New Template') }}
              </el-button>
            </div>
          </template>
          <template slot="card-body">
            <div class="templates-form">
              <div class="templates-form__list">
                <wm-loader
                  v-if="isListLoading"
                  style="padding:20px;"/>
                <div
                  v-else-if="!data.length"
                  class="no-data">
                  {{ wmTranslate('NO_DATA', 'No Data') }}
                </div>
                <el-row
                  v-for="(item, index) in data"
                  v-else
                  :key="index"
                  type="flex"
                  class="templates-form__list__item"
                  justify="space-between">
                  <el-col :span="12">
                    <div
                      class="open-preview"
                      @click="openPreview(item)">
                      <div class="template-details templates-title">{{ item.title }}</div>
                      <div class="template-details templates-subtitle">{{ item.questions_count }} {{ wmTranslate('FORMS.Fields', 'Fields') }}</div>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="template-details">{{ wmTranslate('FORMS.Created_by', 'Created by') }}: {{ item.created_by.firstname }} {{ item.created_by.lastname }}</div>
                    <div class="template-details">{{ wmTranslate('FORMS.Date', 'Date') }}: {{ item.created_at | formatDate }}</div>
                  </el-col>
                  <div
                    v-if="!item.is_system_form"
                    class="template-detils template-options">
                    <el-dropdown trigger="click">
                      <el-button
                        type="primary"
                        size="small">
                        {{ wmTranslate('FORMS.Options', 'Options') }} <i class="el-icon-arrow-down el-icon--right"/>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                          <a
                            href="javascript:void(0)"
                            class="dropdown-item"
                            @click="editTemplate(item)">
                            <i class="el-icon-edit" />
                            {{ wmTranslate('FORMS.Edit', 'Edit') }}
                          </a>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <a
                            href="javascript:void(0)"
                            class="dropdown-item"
                            @click="duplicateTemplate(item)">
                            <i class="el-icon-edit-outline" />
                            {{ wmTranslate('FORMS.Duplicate', 'Duplicate') }}
                          </a>
                        </el-dropdown-item>
                        <el-dropdown-item>
                          <a
                            href="javascript:void(0)"
                            class="dropdown-item"
                            @click="deleteTemplate(item.id)">
                            <i class="el-icon-delete"/>
                            {{ wmTranslate('FORMS.Delete', 'Delete') }}
                          </a>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </el-row>
              </div>
            </div>
          </template>
        </ps-card>
      </wm-col>
      <wm-col
        :cols="[24,24,8,8]"
        :customClass="'sticky-container'">
        <ps-card
          :title="activeForm.length !== 0 ? activeForm[0].title : ''">
          <template slot="card-body">
            <div class="preview-details">
              <wm-loader
                v-if="isPreviewLoading"
                style="padding:20px;"/>
              <div
                v-else-if="!activeForm.length"
                class="no-data">
                {{ wmTranslate('NO_DATA', 'No Data') }}
              </div>
              <template v-else>
                <template v-for="(item, index) in activeForm">
                  <div :key="index">
                    <div class="preview-created">
                      <p>{{ wmTranslate('FORMS.Created_by', 'Created by') }}: {{ item.created_by.firstname }} {{ item.created_by.lastname }}</p>
                      <p>{{ wmTranslate('FORMS.Date', 'Date') }}: {{ item.created_at | formatDate }}</p>
                    </div>
                    <div class="preview-title">
                      <p>{{ item.title }}</p>
                      <p>{{ item.description }}</p>
                    </div>
                    <div class="preview-questions">
                      <template v-if="item.id">
                        <ul>
                          <li
                            v-for="(field, index) in item.fields"
                            :key="index"
                            class="preview-item">
                            <div v-if="field.title">
                              {{ field.title }} <span class="preview-questins-type">{{ field.value_type | formatFieldTypeText }}</span>
                            </div>
                          </li>
                        </ul>
                      </template>
                      <template v-else>
                        {{ wmTranslate('FORMS.No_existing_questions', 'No Existing Questions') }}
                      </template>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </template>
        </ps-card>
      </wm-col>
    </el-row>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import factory from '~/factories';

const Forms = factory('constant', 'forms');
const formHelper = factory('helper', 'form');

export default {
  filters: {
    formatFieldTypeText(value) {
      const formattedValue = value ? value.split('_').join(' ') : '';
      return value ? `- ${formattedValue}` : '';
    }
  },
  data() {
    return {
      activeTab: {},
      tabs: [],
      isListLoading: false,
      isPreviewLoading: false,
      data: [],
      activeForm: []
    };
  },
  destroyed() {
    this.$nuxt.$off(Forms.FORMS_LIST_EVENT);
  },
  beforeMount() {
    this.tabs = [{
      id: null,
      label: this.wmTranslate('FORMS.Templates')
    }];
  },
  mounted() {
    this.$nuxt.$emit('changeBreadcrumbsData', formHelper.breadCrumbs(this.wmTranslate));
    this.activeTab = {
      id: null,
      label: this.wmTranslate('FORMS.Templates')
    };
    this.init();
    this.$nuxt.$on(Forms.FORMS_LIST_EVENT, this.init);
  },
  methods: {
    ...mapActions({
      get: 'forms/get',
      deleteForm: 'forms/deleteForm',
      addForm: 'forms/addForm'
    }),
    init() {
      this.isListLoading = true;
      this.isPreviewLoading = true;
      this.getData();
    },
    async getData() {
      const { success, data } = await this.get();
      if (success) {
        this.data = [...data].reverse();
        this.isListLoading = false;
      }
      this.setActiveForm();
    },
    async setActiveForm() {
      const firstForm = this.data && this.data.length ? [this.data[0]] : [];
      if (firstForm.length) {
        const { success, data } = await this.get(firstForm[0].id);
        this.activeForm = success ? [data] : [];
      }
      this.isPreviewLoading = false;
    },
    changeTab(index) {
      this.activeTab = this.tabs[index];
    },
    goToFormBuilder(queryData) {
      const path = '/dashboard/forms/form-builder';
      const query = queryData.id ? queryData : {};
      this.$router.push({
        path,
        query
      });
    },
    editTemplate(formItem) {
      this.goToFormBuilder({ id: formItem.id });
    },
    duplicateTemplate(formItem) {
      const query = {
        id: formItem.id,
        copy: true
      };
      this.goToFormBuilder(query);
    },
    async openPreview(item) {
      this.activeForm = [];
      this.isPreviewLoading = true;
      const { success, data } = await this.get(item.id);
      this.activeForm = success ? [data] : [];
      this.isPreviewLoading = false;
    },
    deleteTemplate(id) {
      this.showConfirmDialog(async () => {
        await this.deleteForm([id]);
        this.$nuxt.$emit(Forms.FORMS_LIST_EVENT);
      }, this.wmTranslate('FORMS.Are_you_sure'), this.wmTranslate('FORMS.Confirm_deletion'));
    },
    async handleCurrentChange(page) {
      this.isListLoading = true;
      this.page = page;
      this.data = await this.getData();
      this.isListLoading = false;
    },
  },
};
</script>

<style lang="sass" scoped>
  @import '../../../assets/sass/variables'

  .templates-form__list__item
    padding: 20px
    align-items: center

    &:not(:first-of-type)
      border-top: 1px solid $--color-divider

    .template-details
      line-height: 20px
      font-size: 13px

    .templates-title
      font:
        size: 18px
        weight: 400

    .template-subtitle
      font-size: 12px

  .open-preview
    cursor: pointer

  .preview-created, .preview-title, .preview-questions
    padding: 20px
    align-items: center
    line-height: 20px

  .preview-questins-type
    text-transform: capitalize

  .preview-created
    font-size: 13px

  .preview-title
    font-size: 14px
    font-weight: 400

  .preview-item
    overflow-wrap: break-word

  .no-data
    padding: 10px
    text-align: center
</style>
