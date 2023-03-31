import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Request from "../../utils/request";
import getCurrentUser from "../../utils/getCurrentUser";
import ConfirmDeleteModal from "../../components/Modal/ConfirmDeleteModal";

function MyGigs() {
  const currentUser = getCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
  const [delteid, setDeleteId] = useState();
  const [title, setTitle] = useState();

  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () =>
      Request.get(`/gigs/getGigs?userId=${currentUser._id}`).then((res) => {
        return res.data;
      }),
  });

  const showdeletModal = (id, title) => {
    setIsOpen(true);
    setTitle(title);
    setDeleteId(id);
  };

  const handleDelete = (id) => {
    setIsOpen(false);

    try {
      const deleteGig = Request.delete(`gigs/deleteGig/${id}`)
        .then((res) => {
          console.log(res);
          queryClient.invalidateQueries(["myGigs"]);
        })
        .catch((err) => {
          console.log("error", err);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleConfirmDelete = () => {
    // Delete the item here
    // console.log("Deleting item:", itemToDelete);

    setIsOpen(false);
    // setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsOpen(false);
  };

  console.log("data::", data);
  console.log("cur user::", currentUser);

  return (
    <div className="myGigs">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
            {currentUser.isSeller && (
              <Link to="/add">
                <button>Add New Gig</button>
              </Link>
            )}
          </div>
          <table>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Sales</th>
              <th>Action</th>
            </tr>
            {data.data.map((gig) => (
              <tr key={gig._id}>
                <td>
                  <img className="image" src={gig.cover.url} alt="" />
                </td>
                <td>{gig.title}</td>
                <td>{gig.price}</td>
                <td>{gig.sales}</td>
                <td>
                  <img
                    className="delete"
                    src="./img/delete.png"
                    alt=""
                    onClick={() => showdeletModal(gig._id, gig.title)}
                  />
                </td>
              </tr>
            ))}
          </table>
          <ConfirmDeleteModal
            isOpen={isOpen}
            onConfirm={handleDelete}
            onCancel={handleCancelDelete}
            id={delteid}
            title={title}
          />
        </div>
      )}
    </div>
  );
}

export default MyGigs;
