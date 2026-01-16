"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function FeatureRequestTab() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [category, setCategory] = useState("ui");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For now, just log to console and show toast
        console.log("Feature Request Submitted:", {
            title,
            description,
            priority,
            category,
            timestamp: new Date().toISOString(),
        });

        toast.success("Feature request submitted!", {
            description: "Thank you for your feedback. We'll review your request soon.",
        });

        // Reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setCategory("ui");
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Request a Feature</h2>
                <p className="text-muted-foreground">
                    Have an idea to improve Reflexion? We'd love to hear it!
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Feature Title *</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief description of the feature"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the feature in detail. What problem does it solve? How would it work?"
                        rows={6}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger id="priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ui">UI/UX</SelectItem>
                                <SelectItem value="backend">Backend</SelectItem>
                                <SelectItem value="integration">Integration</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                    Submit Feature Request
                </Button>
            </form>
        </div>
    );
}
