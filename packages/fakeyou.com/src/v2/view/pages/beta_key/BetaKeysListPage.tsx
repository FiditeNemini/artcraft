import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/pro-solid-svg-icons";
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import {
  Button,
  Container,
  Pagination,
  Panel,
  TempInput,
} from "components/common";
import PageHeader from "components/layout/PageHeader";
import {
  BetaKey,
  ListBetaKeys,
} from "@storyteller/components/src/api/beta_key/ListBetaKeys";
import "./BetaKey.scss";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { useListContent } from "hooks";
import prepFilter from "resources/prepFilter";
import LoadingSpinner from "components/common/LoadingSpinner";

const columnHelper = createColumnHelper<BetaKey>();

export default function BetaKeysListPage() {
  const [loading, setLoading] = useState(true);
  const { pathname: search } = useLocation();
  const urlQueries = new URLSearchParams(search);
  const [list, listSet] = useState<BetaKey[]>([]);
  const [username, usernameSet] = useState("");

  const keysList = useListContent({
    addQueries: {
      page_size: urlQueries.get("page_size") || "20",
      ...(username.trim()
        ? prepFilter(username, "maybe_referrer_username")
        : {}),
    },
    addSetters: { usernameSet },
    debug: "ListBetaKeys",
    fetcher: ListBetaKeys,
    list,
    listSet,
    requestList: true,
    onSuccess: () => setLoading(false),
    urlParam: username.toLowerCase(),
    resultsKey: "beta_keys",
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    keysList.pageChange(selectedItem.selected);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: keysList.pageCount,
    currentPage: keysList.page,
  };

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
    columnHelper.accessor("key_value", {
      header: "Key",
      cell: info => {
        const key = info.getValue();
        return key || "********";
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
  ];

  const table = useReactTable({
    data: keysList.list,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSetUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    usernameSet(e.target.value);
  };

  return (
    <Container type="panel-full">
      <PageHeader title="Beta Keys List" subText="List of beta keys created" />
      <Panel padding={true}>
        <div>
          <div className="d-flex flex-column flex-lg-row">
            <div className="d-flex gap-1 flex-grow-1">
              <TempInput
                placeholder="Search by Referrer Username"
                value={username}
                onChange={handleSetUsername}
                style={{ width: "240px" }}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    keysList.reFetch();
                  }
                }}
              />
              <Button label="Search" onClick={keysList.reFetch} />
            </div>
            <Pagination {...paginationProps} />
          </div>

          {loading ? (
            <div className="py-5">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="table-responsive mt-4 mb-4">
                <table className="table w-100 overflow-hidden">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} colSpan={header.colSpan}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                          <td key={cell.id}>
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
              {list.length === 0 && (
                <div className="my-5 text-center">No data available</div>
              )}
            </>
          )}
          <div className="d-flex justify-content-end">
            <Pagination {...paginationProps} />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
