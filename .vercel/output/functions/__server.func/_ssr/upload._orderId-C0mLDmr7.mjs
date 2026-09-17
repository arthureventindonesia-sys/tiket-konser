import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatRupiah } from "./format-CTnw_oB6.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route } from "./router-BLZJquPt.mjs";
import { t as Button } from "./button-BlpB8QLq.mjs";
import { n as SiteHeader } from "./site-header-CdYtn6jd.mjs";
import { r as uploadProof, t as fetchOrder } from "./orders-BKsi3FNV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/upload._orderId-C0mLDmr7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UploadPage() {
	const { orderId } = Route.useParams();
	const navigate = useNavigate();
	const [order, setOrder] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [fileMeta, setFileMeta] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		fetchOrder({ data: orderId }).then((o) => {
			if (cancelled) return;
			if (o.status === "confirmed") {
				navigate({
					to: "/tiket/$orderId",
					params: { orderId }
				});
				return;
			}
			setOrder(o);
		}).catch((e) => {
			if (!cancelled) setError(e instanceof Error ? e.message : "Tidak ditemukan");
		});
		return () => {
			cancelled = true;
		};
	}, [orderId, navigate]);
	function onFile(file) {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("File harus berupa gambar");
			return;
		}
		if (file.size > 1e6) {
			toast.error("Ukuran gambar maksimal 1 MB");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setPreview(typeof reader.result === "string" ? reader.result : null);
			setFileMeta({
				mime: file.type,
				name: file.name
			});
		};
		reader.readAsDataURL(file);
	}
	async function onSubmit(e) {
		e.preventDefault();
		if (!preview || !fileMeta) {
			toast.error("Pilih gambar bukti transfer");
			return;
		}
		setBusy(true);
		try {
			await uploadProof({ data: {
				publicId: orderId,
				dataUrl: preview,
				mime: fileMeta.mime,
				name: fileMeta.name
			} });
			await navigate({
				to: "/tiket/$orderId",
				params: { orderId }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Gagal mengunggah");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { solid: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-lg px-5 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.24em] text-gold",
					children: "Bukti transfer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Unggah bukti pembayaran"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-danger",
					children: error
				}) : null,
				order ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-8 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border bg-surface p-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: order.fullName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-lg tabular-nums text-gold",
									children: formatRupiah(order.totalAmount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-subtle",
									children: "Pastikan nominal di bukti sama dengan total transfer."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid min-h-44 cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-surface p-4 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/jpeg,image/png,image/webp",
								className: "sr-only",
								onChange: (e) => onFile(e.target.files?.[0])
							}), preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: preview,
								alt: "Pratinjau bukti",
								className: "max-h-64 rounded-md object-contain outline outline-1 -outline-offset-1 outline-fg/10"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted",
								children: [
									"Pilih gambar JPG / PNG / WEBP",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Maksimal 1 MB"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							size: "lg",
							disabled: busy || !preview,
							children: busy ? "Mengunggah…" : "Kirim bukti transfer"
						})
					]
				}) : null
			]
		})]
	});
}
//#endregion
export { UploadPage as component };
