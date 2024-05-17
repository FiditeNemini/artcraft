import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretUp,
  faCheck,
  faTimes,
} from "@fortawesome/pro-solid-svg-icons";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  Column,
} from "@tanstack/react-table";
import { Container, Panel, TempInput } from "components/common";
import PageHeader from "components/layout/PageHeader";
import {
  BetaKey,
  ListBetaKeys,
  ListBetaKeysResponse,
} from "@storyteller/components/src/api/beta_key/ListBetaKeys";
import "./BetaKey.scss";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";

interface CustomColumnMeta {
  className?: string;
  headerClassName?: string;
  canFilter?: boolean;
}

const Filter = ({ column }: { column: Column<BetaKey, unknown> }) => {
  const columnFilterValue = column.getFilterValue();

  if (column.id === "maybe_redeemed_at") {
    return (
      // <TempSelect
      //   value={(columnFilterValue ?? "") as string}
      //   onChange={e => column.setFilterValue(e.target.value)}
      //   className="my-2 py-1"
      //   options={[
      //     { value: "", label: "All" },
      //     { value: "redeemed", label: "Redeemed" },
      //     { value: "not_redeemed", label: "Not Redeemed" },
      //   ]}
      // />\
      null
    );
  }

  return (
    <TempInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="my-2 py-1"
    />
  );
};

export default function BetaKeysListPage() {
  const [data, setData] = useState<BetaKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: ListBetaKeysResponse = await ListBetaKeys("", {});
        if (response.success) {
          setData(response.beta_keys);
        } else {
          console.error("Error fetching data: API call unsuccessful");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columnHelper = createColumnHelper<BetaKey>();

  const columns = [
    columnHelper.accessor("maybe_redeemed_at", {
      header: "Redeemed?",
      cell: info => {
        const value = info.getValue();
        return value ? (
          <FontAwesomeIcon icon={faCheck} className="fs-5 text-success" />
        ) : (
          <FontAwesomeIcon icon={faTimes} className="fs-5 text-danger" />
        );
      },
      meta: {
        className: "status-cell",
        headerClassName: "status-header",
        canFilter: true,
      } as CustomColumnMeta,
      filterFn: (row, columnId, filterValue) => {
        const redeemed = row.getValue(columnId);
        if (filterValue === "redeemed") {
          return !!redeemed;
        }
        if (filterValue === "not_redeemed") {
          return !redeemed;
        }
        return true;
      },
    }),
    columnHelper.accessor("key_value", {
      header: "Key",
      cell: info => {
        const key = info.getValue();

        if (key) {
          return key;
        } else {
          return "********";
        }
      },
    }),
    columnHelper.accessor("maybe_referrer.username", {
      header: "Referrer",
      cell: info => {
        const username = info.getValue();
        const userData = info.row.original.maybe_referrer;
        const userEmailHash = userData?.gravatar_hash || "";

        return username ? (
          <div className="d-flex gap-1 align-items-center">
            <Gravatar
              size={18}
              username={username}
              email_hash={userEmailHash}
              avatarIndex={userData?.default_avatar.image_index}
              backgroundIndex={userData?.default_avatar.color_index}
            />
            <Link to={`/profile/${username}`}>{username}</Link>
          </div>
        ) : (
          "None"
        );
      },
    }),
    columnHelper.accessor("maybe_redeemer.username", {
      header: "Redeemed by",
      cell: info => {
        const username = info.getValue();
        const userData = info.row.original.maybe_redeemer;
        const userEmailHash = userData?.gravatar_hash || "";
        return username ? (
          <div className="d-flex gap-1 align-items-center">
            <Gravatar
              size={18}
              username={username}
              email_hash={userEmailHash}
              avatarIndex={userData?.default_avatar.image_index}
              backgroundIndex={userData?.default_avatar.color_index}
            />
            <Link to={`/profile/${username}`}>{username}</Link>
          </div>
        ) : (
          "-"
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Created Date",
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("maybe_redeemed_at", {
      header: "Redemption Date",
      cell: info => {
        const value = info.getValue();
        return value ? new Date(value).toLocaleDateString() : "-";
      },
    }),
    columnHelper.accessor("creator.username", {
      header: "Key Creator",
      cell: info => {
        const username = info.getValue();
        const userData = info.row.original.creator;
        const userEmailHash = userData?.gravatar_hash || "";
        return (
          <div className="d-flex gap-1 align-items-center">
            <Gravatar
              size={18}
              username={username}
              email_hash={userEmailHash}
              avatarIndex={userData?.default_avatar.image_index}
              backgroundIndex={userData?.default_avatar.color_index}
            />
            <Link to={`/profile/${username}`}>{username}</Link>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Container type="panel-full">
      <PageHeader title="Beta Keys List" subText="List of beta keys created" />
      <Panel padding={true}>
        <div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table w-100">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            style={{ cursor: "pointer" }}
                          >
                            {header.isPlaceholder ? null : (
                              <>
                                <div
                                  {...{
                                    className: header.column.getCanSort()
                                      ? "cursor-pointer select-none"
                                      : "",
                                    onClick:
                                      header.column.getToggleSortingHandler(),
                                  }}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getIsSorted() ? (
                                    header.column.getIsSorted() === "asc" ? (
                                      <FontAwesomeIcon
                                        icon={faCaretUp}
                                        className="ms-2 opacity-75"
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={faCaretDown}
                                        className="ms-2 opacity-75"
                                      />
                                    )
                                  ) : null}
                                </div>
                                {header.column.getCanFilter() ? (
                                  <div>
                                    <Filter column={header.column} />
                                  </div>
                                ) : null}
                              </>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className={
                              (cell.column.columnDef.meta as CustomColumnMeta)
                                ?.className
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length === 0 && (
                <div className="mt-5">No data available</div>
              )}
            </>
          )}
        </div>
      </Panel>
    </Container>
  );
}
