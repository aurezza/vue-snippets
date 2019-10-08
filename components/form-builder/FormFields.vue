<template>
  <div>
    <template v-if="field">
      <template v-if="field.value_type === 'text' || field.value_type === 'textarea'">
        <el-form-item>
          <el-input
            v-model="field.answer"
            :placeholder="field.value_type === 'text' ? wmTranslate('FORMS.PLACEHOLDER.Short_Answer', 'Short Answer') : wmTranslate('FORMS.PLACEHOLDER.Long_Answer', 'Long Answer')"
            :type="field.value_type === 'text' ? 'text' : 'textarea'"
            disabled/>
        </el-form-item>
      </template>
      <template v-if="field.value_type === 'radio' || field.value_type === 'checkbox' || field.value_type === 'select'">
        <ul>
          <li
            v-for="(option, index) in options"
            :key="index">
            <el-row
              type="flex"
              class="row-bg"
              justify="end">
              <el-col :span="24">
                <el-form-item>
                  <el-input v-model="option.value">
                    <template
                      slot="prepend">
                      <i class="material-icons">
                        {{ field.value_type === 'checkbox' ? 'check_box_outline_blank' : 'radio_button_unchecked' }}
                      </i>
                    </template>
                    <el-tooltip
                      slot="append"
                      :content="wmTranslate('FORMS.Remove', 'Remove')"
                      class="item"
                      effect="dark"
                      placement="bottom">
                      <a
                        href="javascript:void(0)"
                        @click="removeOption(index, option)">
                        <i class="material-icons">
                          close
                        </i>
                      </a>
                    </el-tooltip>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </li>
        </ul>
        <div class="button-wrapper">
          <el-button
            size="small"
            icon="el-icon-plus"
            type="primary"
            @click.native="addOption()">
            {{ wmTranslate('FORMS.Add_option', 'Add option') }}
          </el-button>
        </div>
      </template>
      <template v-if="field.value_type === 'date'">
        <el-form-item>
          <el-date-picker
            v-model="field.answer"
            :placeholder="wmTranslate('FORMS.PLACEHOLDER.Date', 'Date')"
            disabled
            type="date"
            value-format="yyyy-MM-dd"
            style="width: 100%;"/>
        </el-form-item>
      </template>
    </template>
  </div>
</template>

<script>
import factory from '~/factories';

const { deleteFormFieldOption } = factory('repository', 'form');

export default {
  props: {
    field: {
      type: Object,
      default: () => {}
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: []
    };
  },
  watch: {
    field() {
      this.options = this.field.options;
    },
  },
  mounted() {
    const field = {
      ...this.field,
      options: this.field.options ? this.field.options : []
    };
    this.options = field.options;
  },
  methods: {
    addOption() {
      if (!this.options) this.options = [];
      this.options.push({ value: ''});
      this.field.options = this.options;
    },
    removeOption(index, { id }) {
      if (id) {
        this.showConfirmDialog(async () => {
          this.field.options.splice(index, 1);
          await deleteFormFieldOption(id);
        }, this.wmTranslate('FORMS.Are you sure you want to delete this option?'), this.wmTranslate('FORMS.Remove_Option'));
      } else {
        this.field.options.splice(index, 1);
      }
    }
  }

};
</script>

 <style lang="sass" scoped>
  .button-wrapper
    margin-bottom: 20px
 </style>
