
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "lucide-react";
import { Control } from "react-hook-form";
import { ProposalFormValues } from "../hooks/useProposalForm";

interface ProposalFormFieldsProps {
  control: Control<ProposalFormValues>;
}

export function ProposalFormFields({ control }: ProposalFormFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proposal Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter proposal title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your proposal in detail..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        

        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (days)</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="number"
                    min="100"
                    max="3650"
                    placeholder="100"
                    {...field}
                    className="pr-12"
                  />
                 
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="projectLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Link </FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="imageLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Link </FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="videoLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Link </FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
