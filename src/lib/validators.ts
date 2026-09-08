// lightweight validators without external zod dep — same API shape used in lib/actions & space-client
function isValidHexColor(v: string): boolean { return /^#[0-9A-Fa-f]{6}$/.test(v); }

export const spaceSchema = {
  parse(obj: any) {
    const r = this.safeParse(obj);
    if (!r.success) throw new Error((r as any).error.issues[0].message);
    return r.data;
  },
  safeParse(obj: any): { success: boolean; data?: any; error?: { issues: { message: string }[] } } {
    const name = String(obj?.name ?? "").trim();
    if (!name) return { success: false, error: { issues: [{ message: "Name is required" }] } };
    if (name.length > 100) return { success: false, error: { issues: [{ message: "Name too long" }] } };
    const type = obj?.type ?? "personal";
    if (!["personal", "company", "client"].includes(type)) return { success: false, error: { issues: [{ message: "Invalid type" }] } };
    const desc = obj?.description ?? null;
    if (desc != null && String(desc).trim().length > 2000) return { success: false, error: { issues: [{ message: "Description too long" }] } };
    const color = obj?.color ?? null;
    if (color != null && String(color).trim() !== "" && !isValidHexColor(String(color).trim())) return { success: false, error: { issues: [{ message: "Invalid color" }] } };
    const icon = obj?.icon ?? null;
    if (icon != null && String(icon).length > 50) return { success: false, error: { issues: [{ message: "Icon too long" }] } };
    return { success: true, data: { name, type, description: desc ? String(desc).trim() || null : null, color: color ? String(color).trim() || null : null, icon: icon ? String(icon).trim() || null : null } };
  },
};

export const entrySchema = {
  parse(obj: any) {
    const r = this.safeParse(obj);
    if (!r.success) throw new Error((r as any).error.issues[0].message);
    return r.data;
  },
  safeParse(obj: any): { success: boolean; data?: any; error?: { issues: { message: string }[] } } {
    const titleRaw = obj?.title;
    const title = titleRaw == null || String(titleRaw).trim() === "" ? null : String(titleRaw).trim();
    if (title != null && title.length > 100) return { success: false, error: { issues: [{ message: "Title too long" }] } };
    const email = String(obj?.email ?? "").trim();
    if (!email) return { success: false, error: { issues: [{ message: "Login is required" }] } };
    if (email.length > 255) return { success: false, error: { issues: [{ message: "Login too long" }] } };
    const password = String(obj?.password ?? "");
    if (!password) return { success: false, error: { issues: [{ message: "Password is required" }] } };
    if (password.length > 1000) return { success: false, error: { issues: [{ message: "Password too long" }] } };
    let url: string | null = obj?.url == null || String(obj.url).trim() === "" ? null : String(obj.url).trim();
    if (url != null) {
      if (url.length > 2048) return { success: false, error: { issues: [{ message: "URL too long" }] } };
      if (!/^https?:\/\/.+/.test(url)) return { success: false, error: { issues: [{ message: "URL must start with http(s)://" }] } };
    }
    const descRaw = obj?.description;
    const description = descRaw == null || String(descRaw).trim() === "" ? null : String(descRaw).trim();
    if (description != null && description.length > 2000) return { success: false, error: { issues: [{ message: "Description too long" }] } };
    const catRaw = obj?.category;
    const category = catRaw == null || String(catRaw).trim() === "" ? null : String(catRaw).trim();
    if (category != null && category.length > 100) return { success: false, error: { issues: [{ message: "Category too long" }] } };
    const icon = obj?.icon == null || String(obj.icon).trim() === "" ? null : String(obj.icon).trim();
    if (icon != null && icon.length > 50) return { success: false, error: { issues: [{ message: "Icon too long" }] } };
    let color: string | null = obj?.color == null || String(obj.color).trim() === "" ? null : String(obj.color).trim();
    if (color != null && !isValidHexColor(color)) return { success: false, error: { issues: [{ message: "Invalid color" }] } };
    const logoUrlRaw = obj?.logoUrl;
    const logoUrl = logoUrlRaw == null || String(logoUrlRaw).trim() === "" ? null : String(logoUrlRaw).trim();
    if (logoUrl != null && logoUrl.length > 2048) return { success: false, error: { issues: [{ message: "Logo URL too long" }] } };
    return { success: true, data: { title, email, password, url, description, category, icon, color, logoUrl, categoryId: obj?.categoryId ?? null, customCategory: obj?.customCategory ?? null } };
  },
};

export const updateEntrySchema = {
  parse(obj: any) {
    const r = this.safeParse(obj);
    if (!r.success) throw new Error((r as any).error.issues[0].message);
    return r.data;
  },
  safeParse(obj: any): { success: boolean; data?: any; error?: { issues: { message: string }[] } } {
    const base = entrySchema.safeParse({ ...obj, password: (obj?.password ?? "") || "placeholder" });
    // allow empty password on update (means keep)
    const email = String(obj?.email ?? "").trim();
    if (!email) return { success: false, error: { issues: [{ message: "Login is required" }] } };
    if (!obj?.entryId || !String(obj.entryId).trim()) return { success: false, error: { issues: [{ message: "Entry id required" }] } };
    if (!obj?.spaceId || !String(obj.spaceId).trim()) return { success: false, error: { issues: [{ message: "Space id required" }] } };
    // validate other fields via entrySchema but allow empty password
    const titleRaw = obj?.title;
    const title = titleRaw == null || String(titleRaw).trim() === "" ? null : String(titleRaw).trim();
    if (title != null && title.length > 100) return { success: false, error: { issues: [{ message: "Title too long" }] } };
    const pwd = obj?.password;
    const password = pwd == null || String(pwd) === "" ? null : String(pwd);
    if (password != null && password.length > 1000) return { success: false, error: { issues: [{ message: "Password too long" }] } };
    let url: string | null = obj?.url == null || String(obj.url).trim() === "" ? null : String(obj.url).trim();
    if (url != null && !/^https?:\/\/.+/.test(url)) return { success: false, error: { issues: [{ message: "URL must start with http(s)://" }] } };
    // reuse other checks from entrySchema for category etc. by calling entrySchema with dummy password if needed
    const catCheck = entrySchema.safeParse({ title, email, password: password || "x", url, description: obj?.description, category: obj?.category, icon: obj?.icon, color: obj?.color, logoUrl: obj?.logoUrl });
    if (!catCheck.success) return catCheck;
    return { success: true, data: obj };
  },
};

export const importRowSchema = entrySchema;

export type EntryInput = ReturnType<typeof entrySchema.parse>;
export type SpaceInput = ReturnType<typeof spaceSchema.parse>;
