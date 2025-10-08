import gradio as gr

with gr.Blocks(title="NeuralForge") as app:
    with gr.Tab("🖼️ IMAGE MODELS"):
        with gr.Row():
            with gr.Column(scale=1, min_width=300):
                with gr.Accordion("⚙️ Train Model", open=True):
                    gr.Markdown("### Hyperparameters")
                    lr_input = gr.Slider(minimum=1e-5, maximum=0.1, step=1e-5, value=1e-3, label="Learning Rate (lr)")
                    epochs_input = gr.Slider(minimum=1, maximum=200, step=1, value=50, label="Epochs")
                    batch_size_input = gr.Slider(minimum=4, maximum=128, step=4, value=32, label="Batch Size")
                    patience_input = gr.Slider(minimum=1, maximum=20, step=1, value=5, label="Early Stopping Patience")
                    train_btn = gr.Button("🚀 Start Training")

                with gr.Accordion("🔬 Test Model", open=False):
                    test_method_input = gr.Radio(
                        ["Test Set Loss", "Visualization (e.g., CAM)", "Ablation Study"],
                        label="Choose Testing Method",
                        value="Test Set Loss"
                    )
                    test_btn = gr.Button("📊 Run Test")

                with gr.Accordion("💾 Save Model", open=False):
                    model_name_input = gr.Textbox(label="Model Filename", placeholder="my_best_model.pth")
                    save_btn = gr.Button("📦 Save Model to Disk")

            with gr.Column(scale=2):
                gr.Markdown("### Output Console")
                train_output = gr.Textbox(label="Training Log & Metrics", lines=15)
                test_graph_output = gr.Plot(label="Test Visualization")
                test_summary_output = gr.Textbox(label="Test Summary", lines=5)
                save_output = gr.Textbox(label="Save Status", lines=1)

    # connect buttons to dummy functions so UI works TODO REPLCAE WITH ACTUAL LOGIC
    train_btn.click( # connect the model_logic function to this
        lambda lr, epochs, batch, patience: f"Training started with lr={lr}, epochs={epochs}, batch={batch}, patience={patience}",
        inputs=[lr_input, epochs_input, batch_size_input, patience_input],
        outputs=[train_output]
    )

    test_btn.click(
        lambda method: (None, f"Test method selected: {method}"),
        inputs=[test_method_input],
        outputs=[test_graph_output, test_summary_output]
    )

    save_btn.click(
        lambda name: f"Model '{name}' would be saved (placeholder)",
        inputs=[model_name_input],
        outputs=[save_output]
    )

# launch
if __name__ == "__main__":
    app.launch(inbrowser=True)