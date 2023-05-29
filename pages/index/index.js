Page({
  data: {
    board: [],
    colors: ['red', 'blue', 'green', 'yellow'],
    prevClickedBlock: null,
  },

  onLoad: function () {
    this.initBoard();
  },

  initBoard: function () {
    const board = [];
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        row.push({ colorIndex: Math.floor(Math.random() * 4), highlighted: false, selected: false });
      }
      board.push(row);
    }
    this.setData({ board });
  },

  checkLine: function (line) {
    const toRemove = [];
    let count = 1;
    for (let i = 1; i < line.length; i++) {
      if (line[i].colorIndex === line[i - 1].colorIndex) {
        count++;
      } else {
        if (count >= 3) {
          for (let j = i - count; j < i; j++) {
            toRemove.push(j);
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let j = line.length - count; j < line.length; j++) {
        toRemove.push(j);
      }
    }
    return toRemove;
  },

  checkAndRemoveBlocks: function () {
    let { board } = this.data;
    const toRemove = [];

    // 检查所有行
    for (let i = 0; i < board.length; i++) {
      const lineToRemove = this.checkLine(board[i]).map((j) => [i, j]);
      toRemove.push(...lineToRemove);
    }

    // 检查所有列
    for (let j = 0; j < board[0].length; j++) {
      const line = board.map((row) => row[j]);
      const lineToRemove = this.checkLine(line).map((i) => [i, j]);
      toRemove.push(...lineToRemove);
    }

    if (toRemove.length > 0) {
      // 高亮即将消除的方块
      for (const [i, j] of toRemove) {
        board[i][j].highlighted = true;
      }
      this.setData({ board });

      // 延迟0.5秒后消除方块
      setTimeout(() => {
        // 移除要消除的方块
        for (const [i, j] of toRemove) {
          board[i][j] = null;
        }
        this.setData({ board });
        this.fillEmptyBlocks();
      }, 500);

      return true; // 返回 true 表示可以消除
    }

    return false; // 返回 false 表示不能消除
  },

  fillEmptyBlocks: function () {
    let { board } = this.data;
    for (let j = 0; j < board[0].length; j++) {
      let empty = -1;
      for (let i = board.length - 1; i >= 0; i--) {
        if (board[i][j] === null) {
          if (empty === -1) {
            empty = i;
          }
        } else if (empty !== -1) {
          board[empty][j] = board[i][j];
          board[i][j] = null;
          empty--;
        }
      }
      for (let i = empty; i >= 0; i--) {
        board[i][j] = { colorIndex: Math.floor(Math.random() * 4), highlighted: false };
      }
    }
    this.setData({ board });
    // 在填补完空缺位置后进行消除检查
    this.checkAndRemoveBlocks();
  },

  handleBlockClick: function (event) {
    let { board } = this.data;
    const { row, col } = event.currentTarget.dataset;
  
    if (this.data.prevClickedBlock) {
      const [prevRow, prevCol] = this.data.prevClickedBlock;
      // 判断是否相邻
      if (
        (Math.abs(prevRow - row) === 1 && prevCol === col) ||
        (Math.abs(prevCol - col) === 1 && prevRow === row)
      ) {
        console.log(`交换方块: (${prevRow}, ${prevCol}) 和 (${row}, ${col})`); // 输出交换方块的日志
        // 交换并检查
        this.swapBlocks(prevRow, prevCol, row, col);
        if (!this.checkAndRemoveBlocks()) {
          // 如果没有方块被消除，撤销交换
          this.swapBlocks(prevRow, prevCol, row, col);
        }
      }
      // 取消选择
      board[prevRow][prevCol].selected = false;
      this.setData({ board });
      this.setData({ prevClickedBlock: null });
    } else {
      // 标记当前选择的方块
      board[row][col].selected = true;
      this.setData({ prevClickedBlock: [row, col], board });
    }
  },

  swapBlocks: function (row1, col1, row2, col2) {
    let { board } = this.data;
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    this.setData({ board });
  },
});
