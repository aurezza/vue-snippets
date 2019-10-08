<template>
  <draggable
    :list="fields"
    :options="{ handle:'.handle' }"
    tag="el-card"
    @end="onDragEnd">
    <el-card
      v-for="(field, index) in formFields"
      :key="index"
      :class="{ 'active': activeIndex === index }"
      class="box-card"
      @click.native="setActiveCard(index)">
      <div class="card">
        <div class="drag-icon">
          <i class="material-icons rotate-icon handle">
            drag_indicator
          </i>
        </div>
        <el-form
          slot="card-body"
          label-position="top">
          <template v-if="field.field_type === 'question'">
            <el-row :gutter="20">
              <div style="margin-top:30px;">
                <el-col :span="16">
                  <el-form-item :label="wmTranslate('FORMS.Question')">
                    <el-input v-model="field.title"/>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="wmTranslate('FORMS.Question_Type')">
                    <el-select
                      v-model="field.value_type"
                      :placeholder="wmTranslate('FORMS.Select')"
                      style="width:100%;">
                      <el-option
                        v-for="(item, index) in value_types"
                        :key="index"
                        :label="item.label"
                        :value="item.type"/>
                    </el-select>
                  </el-form-item>
                </el-col>
              </div>
            </el-row>
            <FormFields
              :field="field"/>
          </template>
          <template v-else>
            <el-row :gutter="20">
              <div style="margin-top:40px;">
                <el-col :span="24">
                  <el-form-item>
                    <el-input
                      v-model="field.title"
                      :placeholder="wmTranslate('FORMS.Untitled_Title')" />
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      v-model="field.description"
                      :rows="3"
                      :placeholder="wmTranslate('FORMS.Description')"
                      type="textarea" />
                  </el-form-item>
                </el-col>
              </div>
            </el-row>
          </template>
          <div class="form-options">
            <el-row
              type="flex"
              class="row-bg"
              justify="end">
              <el-col :span="6">
                <div class="controls">
                  <el-tooltip
                    :content="wmTranslate('FORMS.Copy', 'Copy')"
                    class="item"
                    effect="dark"
                    placement="bottom">
                    <a
                      href="javascript:void(0)"
                      @click="$emit('copyQuestion', field)">
                      <i class="material-icons rotate-icon">
                        filter_none
                      </i>
                    </a>
                  </el-tooltip>
                  <el-tooltip
                    :content="wmTranslate('FORMS.Delete', 'Delete')"
                    class="item"
                    effect="dark"
                    placement="bottom">
                    <a
                      href="javascript:void(0)"
                      @click="$emit('removeQuestion', index, field)">
                      <i class="material-icons">
                        delete
                      </i>
                    </a>
                  </el-tooltip>
                  <div class="separator"/>
                  <el-switch
                    v-model="field.required"
                    :inactive-text="wmTranslate('FORMS.Required')"
                    active-color="primary"/>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
      <div
        v-if="activeIndex === index"
        class="form-builder-buttons">
        <el-tooltip
          slot="append"
          :content="wmTranslate('FORMS.Add_new_question')"
          class="item"
          effect="dark"
          placement="right">
          <a
            href="javascript:void(0)"
            @click="addQuestion">
            <i class="material-icons">
              add_circle
            </i>
          </a>
        </el-tooltip>
        <el-tooltip
          slot="append"
          :content="wmTranslate('FORMS.Add_title_and_description')"
          class="item"
          effect="dark"
          placement="right">
          <a
            href="javascript:void(0)"
            @click="addTitleDescription">
            <i class="material-icons">
              text_fields
            </i>
          </a>
        </el-tooltip>
      </div>
    </el-card>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import FormFields from '~/components/shared/form-builder/FormFields';
import factory from '~/factories';

const formHelper = factory('helper', 'form');

export default {
  components: {
    draggable,
    FormFields
  },
  props: {
    fields: {
      type: Array,
      required: true
    },
    addQuestion: {
      type: Function,
      required: true
    },
    addTitleDescription: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      questionTypes: [],
      activeIndex: undefined,
      formFields: []
    };
  },
  beforeMount() {
    const { questionTypes } = formHelper;
    this.value_types = questionTypes(this.wmTranslate);
  },
  mounted() {
    this.formFields = this.fields;
  },
  methods: {
    setActiveCard(index) {
      this.activeIndex = index;
    },
    onDragEnd(item) {
      this.activeIndex = item.newIndex;
    },
  },
};
</script>

<style lang="sass">
  .form-builder-container
    .el-input-group__prepend
      background: none
      border: 0

  .form-options
    padding-top: 20px
    border-top: 1px solid #e0e0e0

    .controls
      justify-content: flex-end

      a:not(:first-of-type)
        margin-left: 10px

  .box-card
    position: relative
    margin:
      bottom: 20px

    &:first-child
      margin:
        top: 30px

    .form-builder-buttons
      position: absolute
      background-color: #e1e3e4
      top: 0
      right: 0

      @media(max-width: 768px)
        position: static
        margin:
          top: 20px

      a
        display: block
        padding: 4px
    @media(max-width: 768px)
      position: static

    a
      display: block
      padding: 4px
    i.material-icons
      font-size: 24px

  .active
    box-shadow: 0 3px 12px rgba(86, 96, 117, .7) !important

  .handle
    cursor: move
    cursor: -webkit-grabbing
    justify-content: center
    align-items: center

  .drag-icon
    text-align: center

  .rotate-icon
    transform: rotate(90deg)

  .separator
    border-left: 1px solid #e0e0e0
    margin: 0 16px
    width: 0
</style>
