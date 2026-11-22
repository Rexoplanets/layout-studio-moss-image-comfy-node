import { app } from "../../scripts/app.js";

const EXTENSION_NAME = "LayoutStudioForMOSSImage";
const TARGET_NODE_CLASS = "LayoutStudioMOSSImageNode"; // Must match NODE_CLASS_MAPPINGS key in nodes.py
const STUDIO_IFRAME_SRC = "/layout-studio-moss-image-comfy-node/standalone_app/Layout_Studio_for_MOSS_Image_Comfy_Node.html?comfy=1"; // Must match __init__.py route

app.registerExtension({
    name: EXTENSION_NAME,
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== TARGET_NODE_CLASS) return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
            if (!this.widgets?.some((w) => w.name === "Open Layout Studio")) {
                this.addWidget("button", "Open Layout Studio", null, () => {
                    const jsonWidget = this.widgets?.find((w) => w.name === "JSON prompt");
                    if (!jsonWidget) {
                        console.error("The Layout Studio for MOSS-Image: 'JSON prompt' widget not found.");
                        return;
                    }
                    openStudioModal(jsonWidget);
                });
            }
            return result;
        };
    },
});

function openStudioModal(jsonWidget) {
    // 1. Create dark background overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: "9999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
    });

    // 2. Create resizable modal container box
    const modalBox = document.createElement("div");
    Object.assign(modalBox.style, {
        width: "92vw",
        height: "90vh",
        minWidth: "600px",
        minHeight: "400px",
        maxWidth: "98vw",
        maxHeight: "98vh",
        resize: "both",
        overflow: "hidden",
        border: "2px solid #444",
        borderRadius: "10px",
        backgroundColor: "#111",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        position: "relative",
        pointerEvents: "auto",
    });

    // 3. Create close "X" button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    Object.assign(closeBtn.style, {
        position: "absolute",
        top: "8px",
        right: "12px",
        background: "transparent",
        border: "none",
        color: "#aaa",
        fontSize: "24px",
        fontWeight: "bold",
        cursor: "pointer",
        zIndex: "10000",
        lineHeight: "1",
        padding: "0",
    });
    closeBtn.onmouseover = () => (closeBtn.style.color = "#fff");
    closeBtn.onmouseout = () => (closeBtn.style.color = "#aaa");
    closeBtn.onclick = () => cleanup();

    modalBox.appendChild(closeBtn);

    // 4. Load HTML Studio inside iframe
    const iframe = document.createElement("iframe");
    iframe.src = STUDIO_IFRAME_SRC;
    Object.assign(iframe.style, {
        width: "100%",
        height: "100%",
        flex: "1",
        border: "none",
        backgroundColor: "#111",
    });

    modalBox.appendChild(iframe);
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    // 5. Send saved JSON once loaded
    iframe.onload = () => {
        iframe.contentWindow?.postMessage(
            { type: "LOAD_MOSS_JSON", payload: jsonWidget.value },
            window.location.origin
        );
    };

    // 6. Handle messages back from iframe
    const messageHandler = (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }
        if (event.data?.type === "SAVE_MOSS_JSON") {
            jsonWidget.value = event.data.payload;
            if (typeof jsonWidget.callback === "function") {
                jsonWidget.callback(jsonWidget.value);
            }
            cleanup();
        } else if (event.data?.type === "CLOSE_STUDIO_MOSS") {
            cleanup();
        }
    };

    const cleanup = () => {
        window.removeEventListener("message", messageHandler);
        if (overlay && overlay.parentNode) {
            overlay.remove();
        }
    };

    window.addEventListener("message", messageHandler);
}
