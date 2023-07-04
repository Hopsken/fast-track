import type { PropsWithChildren } from "react"

export type FieldControlProps = {
  size: "sm" | "lg"
  title: string
  description: string | React.ReactNode
}

export function FieldControl(props: PropsWithChildren<FieldControlProps>) {
  return (
    <div className="field flex items-center">
      <div className="flex flex-1 flex-col space-y-1">
        <div className={props.size === "sm" ? "text-sm" : "text-lg"}>
          {props.title}
        </div>
        <div
          className={`${
            props.size === "sm" ? "text-xs" : "text-base"
          } text-slate-500`}>
          {props.description}
        </div>
      </div>
      <div className="flex flex-none items-center justify-center">
        {props.children}
      </div>
    </div>
  )
}
