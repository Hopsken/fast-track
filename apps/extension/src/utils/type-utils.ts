// 提取数组元素类型，如果不是数组则返回本身
// 例如: UnwrapArray<User[]> -> User
// 例如: UnwrapArray<User> -> User
export type UnwrapArray<T> = T extends (infer U)[] ? U : T
