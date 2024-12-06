# File: train_model.py

from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import pandas as pd
import torch

# Load and preprocess data
data = pd.read_csv("data/hinglish_dataset.csv")  # Path to your dataset
train_texts, val_texts, train_labels, val_labels = train_test_split(
    data['text'], data['label'], test_size=0.2
)

# Load tokenizer and model
model_name = "ai4bharat/indic-bert"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)

# Tokenize data
train_encodings = tokenizer(list(train_texts), truncation=True, padding=True, max_length=128)
val_encodings = tokenizer(list(val_texts), truncation=True, padding=True, max_length=128)

# Create PyTorch datasets
class HinglishDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

train_dataset = HinglishDataset(train_encodings, train_labels.tolist())
val_dataset = HinglishDataset(val_encodings, val_labels.tolist())

# Train model
training_args = TrainingArguments(
    output_dir="./hinglish_model",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    evaluation_strategy="epoch",
    save_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

trainer.train()
model.save_pretrained("hinglish_model")
tokenizer.save_pretrained("hinglish_model")
