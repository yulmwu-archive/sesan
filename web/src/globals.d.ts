/// <reference types="svelte" />

declare const monaco: any

declare module '*.svelte' {
    import { Components } from 'svelte'

    const components: Components
    export default components
}
