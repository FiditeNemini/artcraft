const prepFilter = (value: string, queryKey: string) => ({ ...value !== "all" ? { [queryKey]: value } : {} });

export default prepFilter;