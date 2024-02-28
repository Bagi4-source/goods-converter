class Node {
  data: any;
  next: Node | null;
  constructor(data: any) {
    this.data = data;
    this.next = null;
  }
}

class Stack {
  private top: Node | null;
  private size: number;
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(data: any) {
    const newNode = new Node(data);
    newNode.next = this.top;
    this.top = newNode;
    this.size++;
  }

  pop() {
    if (!this.top) return null;

    const poppedNode = this.top;
    this.top = poppedNode.next;
    this.size--;
    return poppedNode.data;
  }

  peek() {
    return this.top ? this.top.data : null;
  }

  isEmpty() {
    return this.size === 0;
  }

  getSize() {
    return this.size;
  }
}
