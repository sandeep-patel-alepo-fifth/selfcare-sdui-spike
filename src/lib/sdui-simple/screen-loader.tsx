"use client";

import { useState, useCallback } from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import type { ScreenConfig, ActionResult } from "./types";
import { useActions } from "./actions";

// =============================================================================
// Screen Loader Component
// =============================================================================

interface ScreenLoaderProps {
  screen: ScreenConfig;
  onComplete?: (data: Record<string, unknown>) => void;
}

export function ScreenLoader({ screen, onComplete }: ScreenLoaderProps) {
  const [data, setData] = useState<Record<string, unknown>>(
    screen.form?.initialData || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { execute } = useActions();

  const handleChange = useCallback(
    ({ data: newData }: { data: unknown }) => {
      setData(newData as Record<string, unknown>);
      setErrors({});
    },
    []
  );

  const handleAction = useCallback(
    async (actionName: string) => {
      setLoading(true);
      setErrors({});

      try {
        const result: ActionResult = await execute(actionName, data);

        if (!result.success && result.errors) {
          setErrors(result.errors);
        }

        if (result.success && onComplete) {
          onComplete(data);
        }
      } finally {
        setLoading(false);
      }
    },
    [execute, data, onComplete]
  );

  // Form screen type
  if (screen.type === "form" && screen.form) {
    return (
      <Box sx={{ maxWidth: 500, mx: "auto", p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {screen.title}
        </Typography>

        {screen.description && (
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {screen.description}
          </Typography>
        )}

        <JsonForms
          schema={screen.form.schema}
          uischema={screen.form.uiSchema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={handleChange}
        />

        {/* Display errors */}
        {Object.entries(errors).map(([field, message]) => (
          <Typography key={field} color="error" variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        ))}

        {/* Action buttons */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          {screen.actions &&
            Object.entries(screen.actions).map(([name]) => (
              <Button
                key={name}
                variant={name === "submit" ? "contained" : "outlined"}
                onClick={() => handleAction(name)}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : name}
              </Button>
            ))}
        </Box>
      </Box>
    );
  }

  // Fallback for unsupported types
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography color="error">
        Unsupported screen type: {screen.type}
      </Typography>
    </Box>
  );
}
