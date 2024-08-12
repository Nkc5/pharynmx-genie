declare type promptBody = {
    role: string,
    content: string,
}

declare type llmQuery = {
    workspaceId: string,
    prompt: string,
}