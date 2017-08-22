<template>
  <el-tree
    :data="data3"
    show-checkbox
    node-key="id"
    default-expand-all
    :render-content="fn1"
    @node-expand="expand"
    @node-collapse="collapse"
    @node-click="handleNodeClick"
    >
  </el-tree>
</template>
<script>
  var testloc = require("./loc.js");
  export default {
    data() {
      return {
        data3: [
          testloc
        ],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      };
    },
    created: function(){
      var flatLevel = 5;
      var selectors = "";
      for(let i=0; i < flatLevel; i++){
        selectors += '.el-tree-node ';
      }
      //selectors = ".el-tree-node > .el-tree-node > .el-tree-node > .el-tree-node__children > .el-tree-node "
      this.$nextTick(function () {
        // DOM 现在更新了
        // `this` 绑定到当前实例
        $("#app").find(selectors).css('display', 'inline-block').addClass('ppp').removeClass('is-expanded').find('.el-tree-node__expand-icon').removeClass('expanded').addClass('is-leaf');
      })
    },
    methods: {
      fn1 (h, { node, data, store }) {
        return h('span', [
          data.label
        ])
      },
      expand () {
        debugger;
        return;
      },
      collapse () {
        debugger;
        return;
      },
      handleNodeClick(a, b, c, e) {
        console.log(a);
        return;
      }
    }
  };
</script>
<style lang="styl">
  .ppp
    float left
    .el-tree-node__children
      display none
</style>