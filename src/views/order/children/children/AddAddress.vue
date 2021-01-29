<template>
  <div id="addAddress">
    <van-nav-bar
        title="添加地址"
        left-arrow
        :fixed=true
        :border=true
        @click-left="onClickLeft"
    />
    <!-- 编辑地址 -->
    <van-address-edit
        :area-list="areaList"
        show-postal
        :search-result="searchResult"
        :area-columns-placeholder="['请选择', '请选择', '请选择']"
        @save="onSave"
        @change-detail="onChangeDetail"
        style="margin-top: 3rem;"
    />
  </div>
</template>

<script>
import {Toast} from 'vant'
import areaList from '../../../../config/area'
import {addUserAddress} from '../../../../service/api/index'
import {mapState} from 'vuex'
import PubSub from 'pubsub-js'

export default {
  name: "AddAddress",
  data() {
    return {
      areaList: areaList,
      searchResult: [],
    };
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    onClickLeft() {  // 点击左边 返回
      this.$router.go(-1);
    },
    // 保存用户信息
    async onSave(content) {
      if (this.userInfo.token) {
        let result = await addUserAddress(
            this.userInfo.token,
            content.name,
            content.tel,
            content.province + content.city + content.county,
            content.addressDetail,
            content.postalCode,
            content.isDefault,
            content.province,
            content.city,
            content.county,
            content.areaCode
        );
        if (result.success_code === 200) {  // 添加成功
          Toast({
            message: '添加地址成功',
            duration: 400
          });
          this.$router.back();
          // 发起通知
          PubSub.publish('backToMyAddress');
        } else {
          Toast({
            message: '添加地址失败',
            duration: 400
          });
        }
      }
    },
    onChangeDetail(val) {
      if (val) {
        this.searchResult = [
          {
            name: '黄龙万科中心',
            address: '杭州市西湖区',
          },
        ];
      } else {
        this.searchResult = [];
      }
    }
  }
}
</script>

<style scoped>
  #addAddress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #F5F5F5;
    z-index: 9999;
  }
</style>