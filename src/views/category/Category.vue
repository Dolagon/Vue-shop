<template>
  <div id="category">
    <!-- 头部 -->
    <Header></Header>
    <!-- 内容 -->
    <div v-if="!showLoading" class="listWrapper">
      <!-- 左边 -->
      <div class="leftWrapper">
        <ul class="wrapper">
          <li
              class="categoryItem"
              v-for="(cate, index) in categoriesData"
              :class="{selected: currentIndex === index}"
              @click="clickLeftLi(index)"
              :key="cate.id"
              ref="menuList"
          >
            <span class="textWrapper">{{ cate.name }}</span>
          </li>
        </ul>
      </div>
      <!-- 右边 -->
      <ContentView :categoriesDetailData="categoriesDetailData"></ContentView>
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
import Header from "./components/Header";
import ContentView from "./components/ContentView";

// 引入通知插件
import Pubsub from 'pubsub-js'
import {Toast} from 'vant'

// 引入滚动组件
import BScroll from 'better-scroll'

// 引入接口
import {getCategories, getCategoriesDetail} from './../../service/api/index'
import PubSub from "pubsub-js";

export default {
  name: "Category",
  components: {
    Header,
    ContentView
  },
  data() {
    return {
      showLoading: true,
      // 左边列表数据
      categoriesData: [],
      // 右边列表数据
      categoriesDetailData: [],
      // 左边item选中与否
      currentIndex: 0
    }
  },
  created() {
    this.initData();
  },
  mounted() {

  },
  methods: {
    // 初始化操作（数据和界面）
    async initData() {
      // 1. 获取左边的数据
      let leftRes = await getCategories();
      if (leftRes.success) {
        this.categoriesData = leftRes.data.cate;
      }

      // 2. 获取右边的数据
      let rightRes = await getCategoriesDetail('lk001');
      if (rightRes.success) {
        this.categoriesDetailData = rightRes.data.cate;
      }

      // 3. 隐藏loading框
      this.showLoading = false;

      // 4. 初始化滚动框架
      this.$nextTick(()=>{
        // 作用到左边的标签 leftWrapper
        this.leftScroll = new BScroll('.leftWrapper', {
          probeType: 3,
          click: true,
          scrollY: true,
          tap: true,
          mouseWheel: true
        });
      });
    },
    // 处理左边的点击
    async clickLeftLi(index) {
      // 1. 改变索引
      this.currentIndex = index;

      // 2. 滚动到对应对的位置
      let menuList = this.$refs.menuList;
      let el = menuList[index];

      // 3. 滚动到对应的元素上
      this.leftScroll.scrollToElement(el, 300);

      // 4. 获取右边的数据
      let rightRes = await getCategoriesDetail(`lk00${index + 1}`);
      if (rightRes.success) {
        this.categoriesDetailData = rightRes.data.cate;
      }
    }
  }
}
</script>

<style scoped>
  #category {
    width: 100%;
    height: 100%;
    background-color: #F5F5F5;
    overflow: hidden;
  }

  .listWrapper {
    display: flex;
    position: absolute;
    top: 2.75rem;
    bottom: 3rem;
    width: 100%;
    overflow: hidden;
  }

  .leftWrapper {
    background-color: #F4F4F4;
    width: 5.3125rem;
    flex: 0 0 5.3125rem;
  }

  .categoryItem {
    padding: 0.75rem 0;
    border-bottom: solid 1px #E8E9E8;
    position: relative;
  }

  .categoryItem .textWrapper {
    line-height: 1.25rem;
    border-left: solid 0.1875rem transparent;
    padding: 0.3125rem 0.6875rem;
    font-size: 0.8125rem;
    color: #666666;
  }

  .categoryItem.selected {
    background: #FFF;
  }

  .categoryItem.selected .textWrapper {
    border-left-color: #3cb963;
    font-weight: bold;
    font-size: 0.875rem;
    color: #333333;
  }

  @media (min-width: 960px) {
    .wrapper {
      border-right: 1px solid #E8E9E8;
    }

    .wrapper .categoryItem {
      background: #fff;
    }
  }
</style>