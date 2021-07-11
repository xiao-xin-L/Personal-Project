<template>
  <div>
    <el-row :gutter="10" type="flex">
      <el-col :span="6">
        <el-card class="box-card" style="height: 100%">
          <div slot="header" class="clearfix">
            <span>当前用户总数</span>
          </div>
          <div style="font-size: 60px; text-align: center; font-weight: bolder">
            {{ userNum }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>用户注册趋势</span>
          </div>
          <div ref="userDataWrapper">
            <div
              ref="userData"
              :style="{
                height: userDataChartsSize.height + 'px',
                width: userDataChartsSize.width + 'px',
                margin: 'auto',
              }"
            ></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10" type="flex" style="margin-top: 20px">
      <el-col :span="6">
        <el-card class="box-card" style="height: 100%">
          <div slot="header" class="clearfix">
            <span>当前博客总数</span>
          </div>
          <div style="font-size: 60px; text-align: center; font-weight: bolder">
            {{ blogNum }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>博客发布趋势</span>
          </div>
          <div ref="blogDataWrapper">
            <div
              ref="blogData"
              :style="{
                height: blogDataChartsSize.height + 'px',
                width: blogDataChartsSize.width + 'px',
                margin: 'auto',
              }"
            ></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>用户位置分布</span>
          </div>
          <div ref="visitorDataWrapper">
            <div
              ref="visitorData"
              :style="{
                height: visitorDataChartsSize.height + 'px',
                width: visitorDataChartsSize.width + 'px',
                margin: 'auto',
              }"
            ></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>用户访问数据表</span>
          </div>
          <div>
            <el-table :data="visitorData" stripe style="width: 100%">
              <el-table-column prop="ip" label="IP" width="180">
              </el-table-column>
              <el-table-column prop="province" label="省份" width="180">
              </el-table-column>
              <el-table-column prop="city" label="城市"> </el-table-column>
              <el-table-column prop="visitTime" label="访问时间">
              </el-table-column>
              <el-table-column prop="location" label="用户坐标">
                <template slot-scope="scope">
                  <span> {{ scope.row.location[0] }} </span> -
                  <span> {{ scope.row.location[1] }} </span>
                </template>
              </el-table-column>
            </el-table>
            <div
              style="display: flex; justify-content: center; margin-top: 20px"
            >
              <el-pagination
                layout="prev, pager, next"
                :total="totalNum"
                :page-size="searchParams.limit"
                @current-change="handleUserCurrentChange"
              >
              </el-pagination>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 第一步, 要引入百度地图
import "echarts/extension/bmap/bmap";
import AuthorService from "@/service/AuthorService";
import BlogService from "@/service/BlogService";
import WebSiteService from "@/service/WebSiteService";
export default {
  name: "DBA",
  data() {
    let vm = this;
    return {
      userNum: 0,
      userDataChartsSize: {
        height: 300,
        width: 600,
      },
      userDataOptions: {
        dataZoom: [
          {
            type: "slider",
            show: true,
            xAxisIndex: [0],
            height: 10,
            bottom: 10,
          },
        ],
        xAxis: {
          type: "time",
          boundaryGap: true,
          position: {
            bottom: "10%",
          },
          axisLabel: {
            formatter: function (v) {
              return vm.$echarts.format.formatTime(
                "yyyy-MM-dd hh:mm",
                new Date(v)
              );
            },
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "line",
            data: [],
            smooth: true,
          },
        ],
      },
      userDataCharts: null,
      blogNum: 0,
      blogDataChartsSize: {
        height: 300,
        width: 600,
      },
      blogDataOptions: {
        dataZoom: [
          {
            type: "slider",
            show: true,
            xAxisIndex: [0],
            height: 10,
            bottom: 10,
          },
        ],
        xAxis: {
          type: "time",
          boundaryGap: true,
          position: {
            bottom: "10%",
          },
          axisLabel: {
            formatter: function (v) {
              return vm.$echarts.format.formatTime(
                "yyyy-MM-dd hh:mm",
                new Date(v)
              );
            },
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "line",
            data: [],
            smooth: true,
          },
        ],
      },
      blogDataCharts: null,
      searchParams: {
        limit: 10,
        offset: 0,
      },
      totalNum: 0,
      visitorData: [],
      visitorDataChartsSize: {
        height: 300,
        width: 600,
      },
      visitorDataOptions: {
        // 第二步: 百度地图的参数配置
        bmap: {
          center: [114, 28],
          zoom: 5,
          roam: true,
        },
        series: [
          {
            type: "effectScatter",
            data: [[113, 27]],
            coordinateSystem: "bmap",
          },
        ],
      },
      visitorDataCharts: null,
    };
  },
  mounted() {
    this.userDataChartsSize.width = this.$refs.userDataWrapper.clientWidth;
    this.userDataChartsSize.height =
      this.$refs.userDataWrapper.clientWidth * 0.3;
    AuthorService.getUserRegisterInfo().then((rs) => {
      this.userNum = rs.data.data.userInfo.length;
      let timedata = [];
      for (let i = 0, len = rs.data.data.userInfo.length; i < len; i++) {
        timedata.push([new Date(rs.data.data.userInfo[i].createTime), 1]);
      }
      this.userDataOptions.series[0].data = timedata;
      this.userDataCharts = this.$echarts.init(this.$refs.userData);
      this.userDataCharts.setOption(this.userDataOptions);
    });

    this.blogDataChartsSize.width = this.$refs.blogDataWrapper.clientWidth;
    this.blogDataChartsSize.height =
      this.$refs.blogDataWrapper.clientWidth * 0.3;
    BlogService.getBlogInfo().then((rs) => {
      this.blogNum = rs.data.data.blogInfo.length;
      let timedata = [];
      for (let i = 0, len = rs.data.data.blogInfo.length; i < len; i++) {
        timedata.push([new Date(rs.data.data.blogInfo[i].lastModified), 1]);
      }
      this.blogDataOptions.series[0].data = timedata;
      this.blogDataCharts = this.$echarts.init(this.$refs.blogData);
      this.blogDataCharts.setOption(this.blogDataOptions);
    });
    // 访客信息数据
    this.visitorDataChartsSize.width = this.$refs.visitorDataWrapper.clientWidth;
    this.visitorDataChartsSize.height =
      this.$refs.visitorDataWrapper.clientWidth * 0.3;
    WebSiteService.getWebSiteData(this.searchParams).then((rs) => {
      this.totalNum = rs.data.data.totalNum;
      this.visitorDataCharts = this.$echarts.init(this.$refs.visitorData);
      let userLocationData = [];
      this.visitorData = rs.data.data.websiteData;
      for (let i = 0, len = rs.data.data.websiteData.length; i < len; i++) {
        userLocationData.push(rs.data.data.websiteData[i].location);
      }
      this.visitorDataOptions.series[0].data = userLocationData;
      this.visitorDataCharts.setOption(this.visitorDataOptions);
      let bmap = this.visitorDataCharts
        .getModel()
        .getComponent("bmap")
        .getBMap(); // 获取百度地图实例
      bmap.setMapStyleV2({
        styleId: "f0744950d4a467f7ff7039b8b504e55d",
      });
    });
  },
  methods: {
    handleUserCurrentChange(page) {
      this.searchParams.offset = (page - 1) * this.searchParams.limit;
      this.getVisitorList();
    },
    getVisitorList() {
      WebSiteService.getWebSiteData(this.searchParams).then((rs) => {
        this.totalNum = rs.data.data.totalNum;
        this.visitorDataCharts = this.$echarts.init(this.$refs.visitorData);
        let userLocationData = [];
        this.visitorData = rs.data.data.websiteData;
        for (let i = 0, len = rs.data.data.websiteData.length; i < len; i++) {
          userLocationData.push(rs.data.data.websiteData[i].location);
        }
        this.visitorDataOptions.series[0].data = userLocationData;
        this.visitorDataCharts.setOption(this.visitorDataOptions);
        let bmap = this.visitorDataCharts
          .getModel()
          .getComponent("bmap")
          .getBMap(); // 获取百度地图实例
        bmap.setMapStyleV2({
          styleId: "f0744950d4a467f7ff7039b8b504e55d",
        });
      });
    },
  },
};
</script>

<style scoped>
</style>
