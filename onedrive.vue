<template>
  <div class="container">
    <ps-card>
      <template slot="card-optional-header">
        <span class="one-drive-title">{{ wmTranslate('ONE_DRIVE.One_Drive') }}</span>
        <div
          style="width: 100%;text-align: right;">
          <el-button
            type="danger"
            size="small"
            class="one-drive-logout"
            @click.native="logout">
            {{ wmTranslate('One_Drive.Log_out') }}
          </el-button>
        </div>
      </template>
      <template slot="card-body">
        <div class="one-drive-container">
          <wm-loader
            v-if="isLoading"
            :loaderText="wmTranslate('ONE_DRIVE.Authenticating')+'...'"
            style="padding:20px"/>
          <div
            v-else
            class="one-drive-content">
            <e-messages
              v-if="errors.length > 0"
              :errors="errors"/>
            <el-button
              v-if="accessFailed"
              type="primary"
              size="small"
              @click.native="oneDriveAuthenticate">{{ wmTranslate('LABEL.Retry') }}</el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              @click.native="triggerFilePicker">
              {{ wmTranslate('ONE_DRIVE.Open_File_Picker') }}
            </el-button>
          </div>
        </div>
      </template>
    </ps-card>
  </div>
</template>

<script>
import factory from '~/factories';

const { getToken } = factory('repository', 'oneDrive');
const oneDriveHelper = factory('helper', 'oneDrive');

export default {
  /**
  * API DOCUMENTATION:
  * https://docs.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/msa-oauth?view=odsp-graph-online
  *
  * */
  data() {
    return {
      odOptions: {},
      isLoading: false,
      accessFailed: false,
      accessToken: null,
      errors: []
    };
  },
  async mounted() {
    this.isLoading = true;
    const { code: oneDriveCode } = this.$nuxt.$route.query;
    oneDriveCode
      ? this.getOneDriveAccessToken(oneDriveCode)
      : this.oneDriveAuthenticate(oneDriveCode);
  },
  methods: {
    oneDriveAuthenticate(oneDriveCode) {
      oneDriveHelper.authenticate();
      this.getOneDriveAccessToken(oneDriveCode);
    },
    async getOneDriveAccessToken(oneDriveCode) {
      const { data } = await getToken({ code: oneDriveCode, redirect_uri: oneDriveHelper.redirectUri });
      this.accessToken = data;
      data ? this.displayAccessSucess() : this.displayAccessError();
      this.isLoading = false;
    },
    displayAccessSucess() {
      this.$notify.success({
        title: this.wmTranslate('LABEL.Success'),
        message: this.wmTranslate('ONE_DRIVE.Successfully_Authenticated')
      });
    },
    displayAccessError() {
      this.accessFailed = true;
      this.errors = [this.wmTranslate('ONE_DRIVE.Something_went_wrong')];
    },
    triggerFilePicker() {
      this.odOptions = {
        clientId: oneDriveHelper.clientId, // registered APP id on microsoft
        action: 'query',
        advanced: {
          accessToken: this.accessToken
        },
        success: (files) => {
          this.openFile(files);
        },
        // cancel() { /* cancel handler */ },
        error: (e) => {
          this.handleError(e);
        }
      };
      this.openFilePicker();
    },
    openFilePicker() {
      try {
        window.OneDrive.open(this.odOptions);
      } catch (e) {
        this.errors = [this.wmTranslate('ONE_DRIVE.Something_went_wrong')];
        this.handleError(e);
      }
    },
    openFile(files) {
      const url = files.value[0].webUrl;
      window.open(url);
    },
    logout() {
      this.showConfirmDialog(() => {
        oneDriveHelper.logoutAccount();
      }, this.wmTranslate('ONE_DRIVE.Continue'), this.wmTranslate('ONE_DRIVE.Log_out'));
    },
    resetData() {
      this.errors = [];
    }
  }
};
</script>

<style lang="sass" scoped>
  .one-drive-container
    padding: 20px

  .one-drive-content
    margin:
      bottom: 10px

  .one-drive-title
    width: 100%
</style>
