export type ActionState = { ok: boolean; message: string; redirectTo?: string };
export type FormAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;
export const initialActionState: ActionState = { ok: false, message: "" };
