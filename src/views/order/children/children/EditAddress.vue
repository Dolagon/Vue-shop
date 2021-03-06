<template>
  <div id="editAddress">
    <van-nav-bar
        title="修改地址"
        left-arrow
        :fixed=true
        :border=true
        @click-left="onClickLeft"
    />
    <!-- 编辑地址 address-info -->
    <van-address-edit
        :area-list="areaList"
        :address-info="addressInfo"
        show-postal
        show-delete
        @save="onSave"
        @delete="onDelete"
        style="margin-top: 3rem"
    />
  </div>
</template>

<script>
import areaList from '../../../../config/area'
import {Toast} from "vant";
import {mapState} from 'vuex'
import {getCurrentUserAddress, changeUserAddress, delUserAddress} from '../../../../service/api/index'
import PubSub from 'pubsub-js'


export default {
  name: "EditAddress",
  data() {
    return {
      areaList: areaList,  // 省市区
      searchResult: [],
      addressInfo: {},  // 地址信息
    };
  },
  mounted() {
    if (this.$route.query.address_id) {  // id存在 发起请求
      if (this.userInfo.token) {  // 并且处于登陆状态
        this.getCurrentAddress(this.userInfo.token, this.$route.query.address_id);
      }
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    onClickLeft() {  // 点击左边 返回
      this.$router.go(-1);
    },
    // 修改收获地址
    async onSave(content) {
      if (this.userInfo.token) {
        // 发起修改请求
        let result = await changeUserAddress(
            this.addressInfo.id,
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
        console.log(result);
        // 判断是否修改成功
        if (result.success_code === 200) {
          Toast({
            message: '修改地址成功',
            duration: 400
          });
          // 返回到上一级
          this.$router.back();
          // 发布修改成功
          PubSub.publish('backToMyAddress');
        } else {
          Toast({
            message: '修改地址失败',
            duration: 400
          });
        }
      }
    },
    // 删除收获地址
    async onDelete() {
      let result = await delUserAddress(this.addressInfo.id);
      console.log(result);
      if (result.success_code === 200) {
        Toast({
          message: '删除地址成功',
          duration: 400
        });
        this.$router.back();
        PubSub.publish('backToMyAddress');
      } else {
        Toast({
          message: '删除地址失败',
          duration: 400
        });
      }
    },
    // 获取当前用户的地址
    async getCurrentAddress(user_id, address_id){
      let result = await getCurrentUserAddress(user_id, address_id);
      if (result.success_code === 200) {
        this.addressInfo = {
          id: result.data._id,
          name: result.data.address_name,
          tel: result.data.address_phone,
          province: result.data.province,
          city: result.data.city,
          county: result.data.county,
          addressDetail: result.data.address_area_detail,
          areaCode: result.data.areaCode,
          postalCode: result.data.address_post_code,
          isDefault: result.data.address_tag
        }
      }
    }
  }
}
</script>

<style scoped>
  #editAddress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #F5F5F5;
    z-index: 9999;
  }
</style>