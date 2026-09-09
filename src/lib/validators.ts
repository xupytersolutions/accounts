// lightweight validators — same API shape as zod but humanized and returns ALL issues
function isValidHexColor(v: string): boolean { return /^#[0-9A-Fa-f]{6}$/.test(v); }

type Issue = { path: string; message: string };
type SafeParseResult<T> = { success: true; data: T } | { success: false; error: { issues: Issue[] } };

export const spaceSchema = {
  parse(obj: any) {
    const r = this.safeParse(obj);
    if (!r.success) throw new Error((r as any).error.issues.map((i: Issue) => i.message).join(", "));
    return r.data;
  },
  safeParse(obj: any): SafeParseResult<any> {
    const issues: Issue[] = [];
    const name = String(obj?.name ?? "").trim();
    if (!name) issues.push({ path: "name", message: "Please enter a space name" });
    else if (name.length > 100) issues.push({ path: "name", message: "Space name must be 100 characters or less" });
    const type = obj?.type ?? "personal";
    if (!["personal", "company", "client"].includes(type)) issues.push({ path: "type", message: "Please select a valid space type" });
    const desc = obj?.description ?? null;
    if (desc != null && String(desc).trim().length > 2000) issues.push({ path: "description", message: "Description must be 2000 characters or less" });
    const color = obj?.color ?? null;
    if (color != null && String(color).trim() !== "" && !isValidHexColor(String(color).trim())) issues.push({ path: "color", message: "Please select a valid color" });
    const icon = obj?.icon ?? null;
    if (icon != null && String(icon).length > 50) issues.push({ path: "icon", message: "Icon name is too long" });
    if (issues.length) return { success: false, error: { issues } };
    return { success: true, data: { name, type, description: desc ? String(desc).trim() || null : null, color: color ? String(color).trim() || null : null, icon: icon ? String(icon).trim() || null : null } };
  },
};

export const entrySchema = {
  parse(obj: any) {
    const r = this.safeParse(obj);
    if (!r.success) throw new Error((r as any).error.issues.map((i: Issue) => i.message).join(", "));
    return r.data;
  },
  safeParse(obj: any): SafeParseResult<any> {
    const issues: Issue[] = [];
    const titleRaw = obj?.title;
    const title = titleRaw == null || String(titleRaw).trim() === "" ? null : String(titleRaw).trim();
    if (title != null && title.length > 100) issues.push({ path: "title", message: "Title must be 100 characters or less" });
    const email = String(obj?.email ?? "").trim();
    if (!email) issues.push({ path: "email", message: "Please enter your username or email" });
    else if (email.length > 255) issues.push({ path: "email", message: "Username is too long (max 255 characters)" });
    const password = String(obj?.password ?? "");
    if (!password) issues.push({ path: "password", message: "Please enter a password" });
    else if (password.length > 1000) issues.push({ path: "password", message: "Password must be 1000 characters or less" });
    let url: string | null = obj?.url == null || String(obj.url).trim() === "" ? null : String(obj.url).trim();
    if (url != null) {
      if (url.length > 2048) issues.push({ path: "url", message: "URL is too long (max 2048 characters)" });
      else if (!/^https?:\/\/.+/.test(url)) issues.push({ path: "url", message: "Please enter a valid URL starting with https://" });
    }
    const descRaw = obj?.description;
    const description = descRaw == null || String(descRaw).trim() === "" ? null : String(descRaw).trim();
    if (description != null && description.length > 2000) issues.push({ path: "description", message: "Note must be 2000 characters or less" });
    const catRaw = obj?.category;
    const category = catRaw == null || String(catRaw).trim() === "" ? null : String(catRaw).trim();
    if (category != null && category.length > 100) issues.push({ path: "category", message: "Category name must be 100 characters or less" });
    const icon = obj?.icon == null || String(obj.icon).trim() === "" ? null : String(obj.icon).trim();
    if (icon != null && icon.length > 50) issues.push({ path: "icon", message: "Icon name is too long" });
    let color: string | null = obj?.color == null || String(obj.color).trim() === "" ? null : String(obj.color).trim();
    if (color != null && !isValidHexColor(color)) issues.push({ path: "color", message: "Please select a valid color" });
    const logoUrlRaw = obj?.logoUrl;
    const logoUrl = logoUrlRaw == null || String(logoUrlRaw).trim() === "" ? null : String(logoUrlRaw).trim();
    if (logoUrl != null && logoUrl.length > 2048) issues.push({ path: "logoUrl", message: "Logo URL is too long (max 2048 characters)" });
    if (issues.length) return { success: false, error: { issues } };
    return { success: true, data: { title, email, password, url, description, category, icon, color, logoUrl, categoryId: obj?.categoryId ?? null, customCategory: obj?.customCategory ?? null } };
  },
};

export const updateEntrySchema = {
  parse(obj: any) {
    const r = this.safeParse(obj);
    if (!r.success) throw new Error((r as any).error.issues.map((i: Issue) => i.message).join(", "));
    return r.data;
  },
  safeParse(obj: any): SafeParseResult<any> {
    const issues: Issue[] = [];
    const titleRaw = obj?.title;
    const title = titleRaw == null || String(titleRaw).trim() === "" ? null : String(titleRaw).trim();
    if (title != null && title.length > 100) issues.push({ path: "title", message: "Title must be 100 characters or less" });
    const email = String(obj?.email ?? "").trim();
    if (!email) issues.push({ path: "email", message: "Please enter your username or email" });
    else if (email.length > 255) issues.push({ path: "email", message: "Username is too long (max 255 characters)" });
    if (!obj?.entryId || !String(obj.entryId).trim()) issues.push({ path: "entryId", message: "Missing account — please try again" });
    if (!obj?.spaceId || !String(obj.spaceId).trim()) issues.push({ path: "spaceId", message: "Missing space — please try again" });
    const pwd = obj?.password;
    const password = pwd == null || String(pwd) === "" ? null : String(pwd);
    if (password != null && password.length > 1000) issues.push({ path: "password", message: "Password must be 1000 characters or less" });
    let url: string | null = obj?.url == null || String(obj.url).trim() === "" ? null : String(obj.url).trim();
    if (url != null) {
      if (url.length > 2048) issues.push({ path: "url", message: "URL is too long (max 2048 characters)" });
      else if (!/^https?:\/\/.+/.test(url)) issues.push({ path: "url", message: "Please enter a valid URL starting with https://" });
    }
    const description = obj?.description == null || String(obj.description).trim() === "" ? null : String(obj.description).trim();
    if (description != null && description.length > 2000) issues.push({ path: "description", message: "Note must be 2000 characters or less" });
    const category = obj?.category == null || String(obj.category).trim() === "" ? null : String(obj.category).trim();
    if (category != null && category.length > 100) issues.push({ path: "category", message: "Category name must be 100 characters or less" });
    const icon = obj?.icon == null || String(obj.icon).trim() === "" ? null : String(obj.icon).trim();
    if (icon != null && icon.length > 50) issues.push({ path: "icon", message: "Icon name is too long" });
    const color = obj?.color == null || String(obj.color).trim() === "" ? null : String(obj.color).trim();
    if (color != null && !isValidHexColor(color)) issues.push({ path: "color", message: "Please select a valid color" });
    const logoUrl = obj?.logoUrl == null || String(obj.logoUrl).trim() === "" ? null : String(obj.logoUrl).trim();
    if (logoUrl != null && logoUrl.length > 2048) issues.push({ path: "logoUrl", message: "Logo URL is too long (max 2048 characters)" });

    // still surface category-related issues via entrySchema shape for completeness (no duplicate password required)
    if (issues.length) return { success: false, error: { issues } };
    return { success: true, data: obj };
  },
};

export const importRowSchema = entrySchema;

export type EntryInput = ReturnType<typeof entrySchema.parse>;
export type SpaceInput = ReturnType<typeof spaceSchema.parse>;
