export interface Recipe {
    name: string;
    id: number;
    sid: string;
    type: number;
    handcraft: boolean;
    explicit: boolean;
    time_spend: number;
    items: number[];
    item_counts: number[];
    results: number[];
    result_counts: number[];
    grid_index: number;
    icon_path: string;
    description: string;
    non_productive: boolean;
}
