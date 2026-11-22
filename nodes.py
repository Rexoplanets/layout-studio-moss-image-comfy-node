class LayoutStudioMOSSImageNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "JSON prompt": ("STRING", {"multiline": True, "default": "{}"}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("JSON prompt",)
    FUNCTION = "output_layout"
    CATEGORY = "MOSS-Image"

    def output_layout(self, **kwargs):
        layout_json = kwargs.get("JSON prompt", "{}")
        return (layout_json,)


NODE_CLASS_MAPPINGS = {
    "LayoutStudioMOSSImageNode": LayoutStudioMOSSImageNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LayoutStudioMOSSImageNode": "The Layout Studio for MOSS-Image",
}
