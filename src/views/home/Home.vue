<template>
  <div id="home">
    <div v-if="!showLoading">
      <Header></Header>
      <!-- 轮播图 -->
      <Sowing :sowing_list="sowing_list"></Sowing>
      <!-- 中部导航 -->
      <Nav :nav_list="nav_list"></Nav>
      <!-- 显示秒杀 -->
      <flashSale :flash_sale_product_list="flash_sale_product_list"></flashSale>
      <!-- 猜你喜欢 -->
      <YouLike :you_like_product_list="you_like_product_list"></YouLike>
      <!-- 返回顶部 为true显示 -->
      <MarkPage v-if="showBackStatus" :scrollToTop="scrollToTop"></MarkPage>
    </div>
    <van-loading
        v-else type="spinner"
        color="#75a342"
        style="position:absolute;left: 50%;top: 40%;transform: translate(-50%)"
    >
      正在加载数据...
    </van-loading>
  </div>
</template>

<script>
// 1. 引入
import {getHomeData} from './../../service/api/index'

// 3. 引入组件
import Header from "./components/header/Header";
import Sowing from "./components/sowing/Sowing";
import Nav from "./components/Nav/Nav";
import flashSale from "./components/flashSale/flashSale";
import YouLike from "./components/youLike/YouLike";
import MarkPage from "./components/markPage/MarkPage";

// 4. 引入返回顶部函数
import {showBack, animate} from "../../config/global";

// 5. 引入通知插件
import Pubsub from 'pubsub-js'
import {Toast} from 'vant'

// 6. 引入vuex
import {mapMutations, mapState} from 'vuex'
import {ADD_GOODS} from "../../store/mutations-type";
import PubSub from "pubsub-js";

// 7. 引入购物车接口
import {addGoodsToCart} from '../../service/api/index'


export default {
  name: "Home",
  data() {
    return {
      // 首页轮播图数据
      sowing_list: [],
      // 导航数据
      nav_list: [],
      // 秒杀数据
      flash_sale_product_list: [],
      // 猜你喜欢
      you_like_product_list: [],
      // 是否显示Loading加载图标
      showLoading: true,
      // 是否显示返回顶部按钮
      showBackStatus: false
    }
  },
  components: {
    Header,
    Sowing,
    Nav,
    flashSale,
    YouLike,
    MarkPage
  },
  methods: {
    ...mapMutations(["ADD_GOODS"]),
    scrollToTop() {
      let docB = document.documentElement || document.body
      // 400ms内滚到顶部 scrollTop 顶部距离0
      animate(docB, {scrollTop: '0'}, 400, 'ease-out');
    },
    async reqData() {
      let res = await getHomeData();
      if (res.success) {  // 数据加载完后显示页面
          this.sowing_list = res.data.list[0].icon_list;
          this.nav_list = res.data.list[2].icon_list;
          this.flash_sale_product_list = res.data.list[3].product_list;
          this.you_like_product_list = res.data.list[12].product_list;

          //  隐藏加载动画
          this.showLoading = false;

          // 开始监听滚动, 到达一定位置就显示返回顶部按钮
          showBack((status)=>{
            this.showBackStatus = status;
          });
        }
    },
    // 添加商品到购物车
    async dealGoodsAdd(goods) {
      // 调用服务器端接口
      let result = await addGoodsToCart(this.userInfo.token, goods.id, goods.name, goods.price, goods.small_image);
      console.log(result);
      if (result.success_code === 200) {
        this.ADD_GOODS({
          goodsId: goods.id,
          goodsName: goods.name,
          smallImage: goods.small_image,
          goodsPrice: goods.price
        });
        // 提示用户
        Toast({
          message: '已添加到购物车',
          duration: 1000
        });
      }
    }
  },
  created() {
    // 2. 请求网络数据
    this.reqData();
  },
  computed: {
    ...mapState(['userInfo'])
  },
  mounted() {
    // 订阅消息（添加到购物车的消息）
    Pubsub.subscribe('homeAddToCart', (msg, goods)=>{
      if (msg === 'homeAddToCart') {
        // 判断用户是否登陆
        if (this.userInfo.token) {  // 有token 已登陆
          this.dealGoodsAdd(goods);
        } else {
          this.$router.push('/login');
        }
      }
    });
  },
  beforeDestroy() {
    PubSub.unsubscribe('homeAddToCart');
  }
}
</script>

<style lang="less" scoped>
  #home {
    width: 100%;
    height: 2000px;
    background-color: #F5F5F5;
  }
</style>