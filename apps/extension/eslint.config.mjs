import { config as reactConfig } from '@internal/eslint-config/react'
import pluginQuery from '@tanstack/eslint-plugin-query'

/** @type {import("eslint").Linter.Config[]} */
export default [...pluginQuery.configs['flat/recommended'], ...reactConfig]
