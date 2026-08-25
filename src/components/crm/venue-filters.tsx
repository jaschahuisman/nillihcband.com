"use client";

import { useMemo, useState } from "react";
import { ListFilter, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { VenueScale, VenueStatus } from "@/db/schema";
import {
  venueScaleLabels,
  venueStatusLabels,
} from "@/lib/crm/labels";
import { cn } from "@/lib/utils";

export type VenueFilters = {
  scales: VenueScale[];
  cities: string[];
  regions: string[];
  statuses: VenueStatus[];
  favoriteOnly: boolean;
};

export const emptyVenueFilters: VenueFilters = {
  scales: [],
  cities: [],
  regions: [],
  statuses: [],
  favoriteOnly: false,
};

export function countActiveVenueFilters(filters: VenueFilters) {
  return (
    filters.scales.length +
    filters.cities.length +
    filters.regions.length +
    filters.statuses.length +
    (filters.favoriteOnly ? 1 : 0)
  );
}

/** Parse smart tokens: scale:club city:Rotterdam regio:"Den Haag & Leiden" status:prospect fav:1 */
export function parseSmartVenueSearch(raw: string): {
  text: string;
  filters: Partial<VenueFilters>;
} {
  const filters: Partial<VenueFilters> = {
    scales: [],
    cities: [],
    regions: [],
    statuses: [],
  };
  const leftover: string[] = [];

  const tokenRe =
    /(scale|schaal|city|stad|regio|region|status|fav|favorite):(?:"([^"]+)"|(\S+))/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      leftover.push(raw.slice(lastIndex, match.index));
    }
    lastIndex = tokenRe.lastIndex;

    const key = match[1].toLowerCase();
    const value = (match[2] ?? match[3] ?? "").trim();
    if (!value) continue;

    if (key === "scale" || key === "schaal") {
      const scale = resolveScale(value);
      if (scale) filters.scales = [...(filters.scales ?? []), scale];
    } else if (key === "city" || key === "stad") {
      filters.cities = [...(filters.cities ?? []), value];
    } else if (key === "regio" || key === "region") {
      filters.regions = [...(filters.regions ?? []), value];
    } else if (key === "status") {
      const status = resolveStatus(value);
      if (status) filters.statuses = [...(filters.statuses ?? []), status];
    } else if (key === "fav" || key === "favorite") {
      filters.favoriteOnly = ["1", "true", "yes", "ja"].includes(
        value.toLowerCase(),
      );
    }
  }

  if (lastIndex < raw.length) leftover.push(raw.slice(lastIndex));

  return {
    text: leftover.join(" ").replace(/\s+/g, " ").trim(),
    filters,
  };
}

function resolveScale(value: string): VenueScale | null {
  const needle = value.toLowerCase();
  for (const [key, label] of Object.entries(venueScaleLabels)) {
    if (key === needle || label.toLowerCase() === needle) {
      return key as VenueScale;
    }
  }
  return null;
}

function resolveStatus(value: string): VenueStatus | null {
  const needle = value.toLowerCase();
  for (const [key, label] of Object.entries(venueStatusLabels)) {
    if (key === needle || label.toLowerCase() === needle) {
      return key as VenueStatus;
    }
  }
  return null;
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function VenueFiltersBar({
  filters,
  onChange,
  cities,
  regions,
}: {
  filters: VenueFilters;
  onChange: (next: VenueFilters) => void;
  cities: string[];
  regions: string[];
}) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveVenueFilters(filters);

  const chips = useMemo(() => {
    const items: { key: string; label: string; clear: () => void }[] = [];

    for (const scale of filters.scales) {
      items.push({
        key: `scale-${scale}`,
        label: `Schaal: ${venueScaleLabels[scale]}`,
        clear: () =>
          onChange({
            ...filters,
            scales: filters.scales.filter((item) => item !== scale),
          }),
      });
    }
    for (const city of filters.cities) {
      items.push({
        key: `city-${city}`,
        label: `Stad: ${city}`,
        clear: () =>
          onChange({
            ...filters,
            cities: filters.cities.filter((item) => item !== city),
          }),
      });
    }
    for (const region of filters.regions) {
      items.push({
        key: `region-${region}`,
        label: `Regio: ${region}`,
        clear: () =>
          onChange({
            ...filters,
            regions: filters.regions.filter((item) => item !== region),
          }),
      });
    }
    for (const status of filters.statuses) {
      items.push({
        key: `status-${status}`,
        label: `Status: ${venueStatusLabels[status]}`,
        clear: () =>
          onChange({
            ...filters,
            statuses: filters.statuses.filter((item) => item !== status),
          }),
      });
    }
    if (filters.favoriteOnly) {
      items.push({
        key: "favorite",
        label: "Alleen favorieten",
        clear: () => onChange({ ...filters, favoriteOnly: false }),
      });
    }

    return items;
  }, [filters, onChange]);

  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={activeCount > 0 ? "secondary" : "outline"}
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2.5 text-xs"
            >
              <ListFilter className="size-3.5" />
              Filters
              {activeCount > 0 ? (
                <Badge
                  variant="outline"
                  className="ml-0.5 h-4 min-w-4 rounded-sm px-1 text-[10px]"
                >
                  {activeCount}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="dark w-80 border-border bg-popover p-0 text-popover-foreground"
          >
            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-3">
              <FilterGroup label="Schaal">
                {Object.entries(venueScaleLabels).map(([value, label]) => (
                  <FilterCheck
                    key={value}
                    label={label}
                    checked={filters.scales.includes(value as VenueScale)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        scales: toggleValue(
                          filters.scales,
                          value as VenueScale,
                        ),
                      })
                    }
                  />
                ))}
              </FilterGroup>

              <Separator />

              <FilterGroup label="Regio">
                {regions.map((region) => (
                  <FilterCheck
                    key={region}
                    label={region}
                    checked={filters.regions.includes(region)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        regions: toggleValue(filters.regions, region),
                      })
                    }
                  />
                ))}
              </FilterGroup>

              <Separator />

              <FilterGroup label="Stad">
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {cities.map((city) => (
                    <FilterCheck
                      key={city}
                      label={city}
                      checked={filters.cities.includes(city)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          cities: toggleValue(filters.cities, city),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterGroup>

              <Separator />

              <FilterGroup label="Status">
                {Object.entries(venueStatusLabels).map(([value, label]) => (
                  <FilterCheck
                    key={value}
                    label={label}
                    checked={filters.statuses.includes(value as VenueStatus)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        statuses: toggleValue(
                          filters.statuses,
                          value as VenueStatus,
                        ),
                      })
                    }
                  />
                ))}
              </FilterGroup>

              <Separator />

              <FilterCheck
                label="Alleen favorieten"
                checked={filters.favoriteOnly}
                onChange={() =>
                  onChange({
                    ...filters,
                    favoriteOnly: !filters.favoriteOnly,
                  })
                }
                icon={<Star className="size-3 fill-primary text-primary" />}
              />
            </div>

            {activeCount > 0 ? (
              <div className="border-t border-border p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-full text-xs"
                  onClick={() => onChange(emptyVenueFilters)}
                >
                  Wis filters
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>

        {activeCount > 0 ? (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange(emptyVenueFilters)}
          >
            Wis alles
          </button>
        ) : (
          <span className="truncate text-[11px] text-muted-foreground">
            Tip: scale:club city:Rotterdam regio:Festivals fav:1
          </span>
        )}
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-muted/40 px-2 text-[11px] text-foreground hover:bg-muted"
            >
              {chip.label}
              <X className="size-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent",
        checked && "bg-accent/70",
      )}
    >
      <span
        className={cn(
          "flex size-3.5 shrink-0 items-center justify-center rounded-sm border border-border",
          checked && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {checked ? <span className="text-[9px] leading-none">✓</span> : null}
      </span>
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
